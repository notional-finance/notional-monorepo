/* eslint-disable */
export default {
  displayName: 'registry-configuration',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/registry-configuration/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/registry-configuration/wrangler.toml',
    wranglerConfigEnv: 'apps/registry-configuration/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/registry-configuration',
  testTimeout: 50000,
};
