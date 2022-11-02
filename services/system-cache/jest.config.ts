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
    scriptPath: 'services/system-cache/dist/index.js',
    modules: true,
    wranglerConfigPath: 'services/system-cache/wrangler.toml',
    wranglerConfigEnv: 'services/system-cache/.env',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/services/system-cache',
  testTimeout: 50000,
};
