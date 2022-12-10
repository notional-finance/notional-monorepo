/* eslint-disable */
export default {
  displayName: 'exchange-rate-monitor',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/exchange-rate-monitor/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/exchange-rate-monitor/wrangler.toml',
    wranglerConfigEnv: 'apps/exchange-rate-monitor/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/exchange-rate-monitor',
  testTimeout: 50000,
};
