/* eslint-disable */
export default {
  displayName: '<%= name %>',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'apps/<%= name %>/dist/index.js',
    modules: true,
    wranglerConfigPath: 'apps/<%= name %>/wrangler.toml',
    wranglerConfigEnv: 'apps/<%= name %>/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/<%= name %>',
  testTimeout: 50000,
};
