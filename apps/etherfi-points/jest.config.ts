/* eslint-disable */
export default {
  displayName: 'etherfi-points',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/etherfi-points/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/etherfi-points/wrangler.toml',
    wranglerConfigEnv: 'apps/etherfi-points/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/etherfi-points',
  testTimeout: 50000,
};
