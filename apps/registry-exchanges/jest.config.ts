/* eslint-disable */
export default {
  displayName: 'registry-exchanges',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/registry-exchanges/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/registry-exchanges/wrangler.toml',
    wranglerConfigEnv: 'apps/registry-exchanges/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/registry-exchanges',
  testTimeout: 50000,
};
