/* eslint-disable */
export default {
  displayName: 'exchange-rates',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/exchange-rates/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/exchange-rates/wrangler.toml',
    wranglerConfigEnv: 'apps/exchange-rates/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/exchange-rates',
  testTimeout: 50000,
};
