const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const playwright = require('eslint-plugin-playwright');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = tseslint.config(
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', 'playwright/.cache/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['playwright/tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Page Object assertion helpers (expectLoaded, expectItemVisible, ...) count as assertions.
      'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['^expect'] }],
    },
  },
  {
    files: ['eslint.config.js'],
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  prettierConfig,
);
