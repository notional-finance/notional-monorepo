/* eslint-disable */
export default {
  displayName: 'blockchain-monitor',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/blockchain-monitor/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/blockchain-monitor/wrangler.toml',
    wranglerConfigEnv: 'apps/blockchain-monitor/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/blockchain-monitor',
  testTimeout: 50000,
};
