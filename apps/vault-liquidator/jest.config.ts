/* eslint-disable */
export default {
  displayName: 'vault-liquidator',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/vault-liquidator/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/vault-liquidator/wrangler.toml',
    wranglerConfigEnv: 'apps/vault-liquidator/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/vault-liquidator',
  testTimeout: 50000,
};
