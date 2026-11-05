import { readdirSync } from 'node:fs';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

const modules = readdirSync(new URL('./src/modules', import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const restrict = (patterns) => ({ 'no-restricted-imports': ['error', { patterns }] });

// A module is reached only through its index.ts; shared code never depends on a module.
const moduleBoundaries = [
  ...modules.map((name) => ({
    files: [`src/modules/${name}/**/*.ts`],
    rules: restrict(
      modules
        .filter((other) => other !== name)
        .map((other) => ({
          regex: `(^|/)${other}/.+`,
          message: `Import the ${other} module through its index ('…/${other}'), not its internals.`,
        })),
    ),
  })),
  {
    files: ['src/*.ts'],
    rules: restrict([
      {
        regex: '(^|/)modules/[^/]+/.+',
        message: "Import a module through its index ('./modules/<name>'), not its internals.",
      },
    ]),
  },
  {
    files: ['src/shared/**/*.ts'],
    rules: restrict([
      { regex: '(^|/)modules(/|$)', message: 'Shared code must not depend on a module.' },
    ]),
  },
];

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  prettier,
  {
    languageOptions: { globals: globals.node },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  ...moduleBoundaries,
);
