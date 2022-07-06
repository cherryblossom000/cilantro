{ pkgs }: {
  deps = with pkgs; [
    nodejs-slim-16_x
    (nodePackages_latest.pnpm.override {
      postInstall = "mkdir -p $out/bin && ln -s $out/lib/node_modules/pnpm/bin/pnpm.cjs $out/bin/pnpm";
    })
    ffmpeg
    python3Minimal # for node-pre-gyp for @discordjs/opus
  ];
}
