export default {
  displayName: 'liquidation-bot',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/liquidation-bot/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/liquidation-bot/wrangler.toml',
    wranglerConfigEnv: 'apps/liquidation-bot/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/liquidation-bot',
  testTimeout: 50000,
};
