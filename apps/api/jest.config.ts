export default {
  displayName: 'api',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/api/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/api/wrangler.toml',
    wranglerConfigEnv: 'apps/api/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/api',
  testTimeout: 50000,
};
