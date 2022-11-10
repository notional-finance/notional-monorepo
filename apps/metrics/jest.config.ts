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
    scriptPath: 'apps/metrics/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/metrics/wrangler.toml',
    wranglerConfigEnv: 'apps/metrics/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/metrics',
  testTimeout: 50000,
};
