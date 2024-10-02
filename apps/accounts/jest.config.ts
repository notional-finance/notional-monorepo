export default {
  displayName: 'accounts',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/accounts/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/accounts/wrangler.toml',
    wranglerConfigEnv: 'apps/accounts/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/accounts',
  testTimeout: 50000,
};
