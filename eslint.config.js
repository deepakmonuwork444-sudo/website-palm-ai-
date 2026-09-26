// ESLint (QA_RELEASE.md §2 check 2): TypeScript, Astro, React hooks and
// jsx-a11y rules; bans dangerouslySetInnerHTML (SECURITY_PRIVACY.md §3).
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'research/',
      'research-tools/',
      'competitors ss/',
      'qa/',
      '.wrangler/',
      'src/legal/',
      // Verbatim copy of the app's code (scripts/sync-palm-lib.mjs, F7): linted in the app repo.
      'src/lib/reading/palm/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  ...astro.configs['flat/jsx-a11y-recommended'],
  {
    files: ['**/*.{tsx,jsx}'],
    ...jsxA11y.configs.recommended,
    plugins: { 'jsx-a11y-x': jsxA11y, 'react-hooks': reactHooks },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'dangerouslySetInnerHTML is banned: render report and user text as React text.',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
);
