export default {
  displayName: 'rewards',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/rewards/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/rewards/wrangler.toml',
    wranglerConfigEnv: 'apps/rewards/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/rewards',
  testTimeout: 50000,
};
