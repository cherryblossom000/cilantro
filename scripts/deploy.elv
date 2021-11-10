#!/usr/bin/env elvish

use str
use path

var scripts-dir = (path:dir (src)[name])
var root-dir = (path:dir $scripts-dir)

rm -r $root-dir/dist

pnpm build
pnpm lint

each [line]{
  var key val = (str:split '=' $line)
  set-env $key $val
} < $scripts-dir/.env-prod

pnpm register-commands

var out-dir = $root-dir/deploy
var _ = ?(rm -rf $out-dir)
mkdir -p $out-dir
cd $out-dir

cp -r $root-dir/dist .

var package = (from-json < $root-dir/package.json)
del package[devDependencies]
to-json [$package] > package.json

cp $root-dir/pnpm-lock.yaml .

echo 'lang = "nix"
run = "pnpm install; pnpm install && pnpm start"' > .replit

echo '{ pkgs }: {
  deps = with pkgs; [
    nodejs-slim-16_x
    (nodePackages_latest.pnpm.override {
      postInstall = "mkdir -p $out/bin && ln -s $out/lib/node_modules/pnpm/bin/pnpm.cjs $out/bin/pnpm";
    })
    ffmpeg
    python3Minimal # for node-pre-gyp for @discordjs/opus
  ];
}' > replit.nix

echo '/node_modules/
/.cache/
' > .gitignore

git init
hub remote add origin cherryblossom000/cilantro
git switch -c replit
git add package.json pnpm-lock.yaml .gitignore .replit replit.nix dist/**.js
git commit -m 'update'
git push -f origin replit
