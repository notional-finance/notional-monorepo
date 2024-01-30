/* eslint-disable */
export default {
  displayName: 'registry-vaults',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/registry-vaults/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/registry-vaults/wrangler.toml',
    wranglerConfigEnv: 'apps/registry-vaults/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/registry-vaults',
  testTimeout: 50000,
};
