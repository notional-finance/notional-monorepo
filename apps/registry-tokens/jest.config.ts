/* eslint-disable */
export default {
  displayName: 'registry-tokens',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/registry-tokens/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/registry-tokens/wrangler.toml',
    wranglerConfigEnv: 'apps/registry-tokens/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/registry-tokens',
  testTimeout: 50000,
};
