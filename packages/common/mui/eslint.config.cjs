const baseConfig = require('../../../eslint.config.js');
/** @type { import("eslint").Linter.Config[] } */
module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],

    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
];
