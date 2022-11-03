/* eslint-disable */
export default {
  displayName: 'metrics',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'services/metrics/dist/index.js',
    modules: true,
    wranglerConfigPath: 'services/metrics/wrangler.toml',
    wranglerConfigEnv: 'services/metrics/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/services/metrics',
  testTimeout: 50000,
};
