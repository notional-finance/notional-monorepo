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
    scriptPath: 'services/<%= name %>/dist/index.js',
    modules: true,
    wranglerConfigPath: 'services/<%= name %>/wrangler.toml',
    wranglerConfigEnv: 'services/<%= name %>/.dev.vars',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/services/<%= name %>',
  testTimeout: 50000,
};
