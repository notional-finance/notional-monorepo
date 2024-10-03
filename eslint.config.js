const nxPlugin = require('@nx/eslint-plugin');
const js = require('@eslint/js');
const ts = require('typescript-eslint');
// const baseConfig = require('./eslint.base.config.js');
const globals = require('globals');
const jsoncParser = require('jsonc-eslint-parser');
const tsParser = require('@typescript-eslint/parser');
const cspellPlugin = require('@cspell/eslint-plugin');
const formatjsPlugin = require('eslint-plugin-formatjs');
const reactHooks = require('eslint-plugin-react-hooks');
const { fixupPluginRules, fixupConfigRules } = require('@eslint/compat');
const mobx = require('eslint-plugin-mobx');
const address = require('eslint-plugin-address');
const { FlatCompat } = require('@eslint/eslintrc');

const flatCompat = new FlatCompat({
  directory: __dirname,
});

/** @type { import("eslint").Linter.Config[] } */
module.exports = [
  {
    ignores: [
      'packages.json',
      '.vscode',
      'packages/**/.graphclient',
      'apps/**/.wrangler',
      '**/node_modules',
      '**/dist',
    ],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.js', '*.js'],
  },
  ...ts.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  {
    plugins: {
      '@typescript-eslint': ts.plugin,
      '@nx': nxPlugin,
      'react-hooks': fixupPluginRules(reactHooks),
      formatjs: formatjsPlugin,
      mobx: fixupPluginRules(mobx),
      '@cspell': cspellPlugin,
    },
  },
  ...fixupConfigRules(flatCompat.extends('next/core-web-vitals')).map(
    // we need to remove react-hooks plugin so it doesn't conflict with the one from @nx/react
    (config) => {
      if (config.plugins?.['react-hooks']) {
        delete config.plugins['react-hooks'];
      }
      return config;
    }
  ),
  // ...nxPlugin.configs['flat/react']
  //   .map((config) => ({
  //     ...config,
  //     files: [
  //       'packages/common/icons/**/*',
  //       'packages/common/styles/**/*',
  //       'packages/common/mui/**/*',
  //       'packages/shared/trade/**/*',
  //       'packages/shared/wallet/**/*',
  //       'packages/shared/web/**/*',
  //       'packages/features/**/*',
  //       'apps/web/**/*',
  //     ],
  //   }))
  //   .map((config) => {
  //     // we need to remove react-hooks plugin so it doesn't conflict with the one from next/core-web-vitals
  //     if (config.plugins?.['react']) {
  //       delete config.plugins['react'];
  //     }
  //     return config;
  //   }),
  {
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@cspell/spellchecker': [
        'error',
        { checkComments: true, autoFix: false },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '[_].*',
          argsIgnorePattern: '[_].*',
          caughtErrorsIgnorePattern: '[_].*',
        },
      ],
      'array-callback-return': ['error'],
      '@nx/enforce-module-boundaries': [
        'warn',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      'formatjs/no-offset': 'error',
      'formatjs/no-id': 'error',
      'mobx/exhaustive-make-observable': 'warn',
      'mobx/unconditional-make-observable': 'error',
      'mobx/missing-make-observable': 'error',
      // NOTE: this is disabled because it is causing false positives
      'mobx/missing-observer': 'off',
      'mobx/no-anonymous-observer': 'warn',
      'react-hooks/exhaustive-deps': ['warn'],
    },
  },
  {
    files: ['packages/**/*', 'apps/web/**/*'],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.jest,
      },
    },
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.spec.js',
      '**/*.spec.jsx',
      '**/*.test.ts',
    ],
    rules: {
      '@typescript-eslint/no-non-null-assertion': ['off'],
    },
  },
  {
    files: [
      'apps/vault-apy/src/config.ts',
      'packages/util/src/constants.ts',
      'packages/core-entities/src/exchanges/default-pools.ts',
    ],
    plugins: { address },
    rules: {
      'address/addr-type': ['error', 'checksum'],
    },
  },
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    rules: {},
  },
];
