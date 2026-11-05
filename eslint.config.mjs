import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  prettier,
  {
    languageOptions: { globals: globals.node },
    rules: {
      // Customer profiles hold PII; all output goes through the redacting logger (OLLI-BE-003).
      'no-console': 'error',
    },
  },
);
