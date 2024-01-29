/* eslint-disable */
export default {
  displayName: 'registry-oracles',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/registry-oracles/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/registry-oracles/wrangler.toml',
    wranglerConfigEnv: 'apps/registry-oracles/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/registry-oracles',
  testTimeout: 50000,
};
