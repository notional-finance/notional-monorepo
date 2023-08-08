/* eslint-disable */
export default {
  displayName: 'data',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/data/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/data/wrangler.toml',
    wranglerConfigEnv: 'apps/data/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/data',
  testTimeout: 50000,
};
