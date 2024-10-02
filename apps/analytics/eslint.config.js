const baseConfig = require('../../eslint.config.js');

/** @type { import("eslint").Linter.Config[] } */
module.exports = [
  ...baseConfig,
  {
    settings: {
      'import/resolver': {
        node: {
          moduleDirectory: ['node_modules', 'src/']
        },

        typescript: {
          alwaysTryTypes: true
        }
      }
    },

    rules: {
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'prefer-const': 'off',
      'formatjs/no-id': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/jsx-filename-extension': 'off',
      'no-param-reassign': 'off',
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/no-array-index-key': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'off',
      'import/order': 'off',
      'no-console': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'import/no-cycle': 'off',
      'prefer-destructuring': 'off',
      'import/no-extraneous-dependencies': 'off',
      'react/display-name': 'off',
      'import/no-unresolved': ['off', { caseSensitive: false }],
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@mui/*/*/*', '!@mui/material/test-utils/*']
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'none'
        }
      ]
    }
  },
  {
    files: [
      'package.json',
      'apps/analytics/src/utils/locales/*.json',
      'apps/analytics/src/views/**/*',
      'apps/analytics/src/sections/**/*',
      'apps/analytics/src/data/**/*'
    ],

    rules: {
      '@cspell/spellchecker': ['off']
    }
  }
];
