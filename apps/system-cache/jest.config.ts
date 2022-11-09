/* eslint-disable */
export default {
  displayName: 'system-cache',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/system-cache/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/system-cache/wrangler.toml',
    wranglerConfigEnv: 'apps/system-cache/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/system-cache',
  testTimeout: 50000,
};
