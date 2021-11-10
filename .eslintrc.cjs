'use strict'

const path = require('node:path')

const tsconfigRootDir = __dirname
const projects = ['src/tsconfig.json', 'scripts/tsconfig.json']

/** @type {import('eslint').Linter.Config & {parserOptions?: import('@typescript-eslint/parser').ParserOptions}} */
module.exports = {
  root: true,
  extends: [
    '@cherryblossom/eslint-config/node',
    '@cherryblossom/eslint-config/node/16'
  ],
  ignorePatterns: ['.history/', 'dist/'],
  parserOptions: {project: projects, tsconfigRootDir},
  overrides: [
    {
      files: '**/.eslintrc.cjs',
      settings: {
        jsdoc: {mode: 'typescript'}
      },
      rules: {
        'import/no-unused-modules': 0
      }
    },
    {
      files: '**/*.ts',
      settings: {
        'import/resolver': {
          typescript: {
            project: projects.map(project =>
              path.join(tsconfigRootDir, project)
            )
          }
        }
      }
    },
    {
      files: 'scripts/**/*.ts',
      extends: ['@cherryblossom/eslint-config/ts/node/esm'],
      rules: {
        'node/no-extraneous-import': 0,
        'node/no-process-exit': 0,
        'node/no-unpublished-import': 0
      }
    }
  ]
}
