/* eslint-disable */
export default {
  displayName: 'registry',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/registry/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/registry/wrangler.toml',
    wranglerConfigEnv: 'apps/registry/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/registry',
  testTimeout: 50000,
};
