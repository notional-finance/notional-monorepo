/* eslint-disable */
export default {
  displayName: 'registry-exchange',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/registry-exchange/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/registry-exchange/wrangler.toml',
    wranglerConfigEnv: 'apps/registry-exchange/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/registry-exchange',
  testTimeout: 50000,
};
