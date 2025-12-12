/* eslint-disable */
export default {
  displayName: 'beta-contest',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/beta-contest/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/beta-contest/wrangler.toml',
    wranglerConfigEnv: 'apps/beta-contest/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/beta-contest',
  testTimeout: 50000,
};
