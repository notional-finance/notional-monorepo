export default {
  displayName: 'points',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/points/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/points/wrangler.toml',
    wranglerConfigEnv: 'apps/points/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/points',
  testTimeout: 50000,
};
