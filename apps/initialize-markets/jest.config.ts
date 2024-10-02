export default {
  displayName: 'initialize-markets',
  preset: '../../jest.preset.js',
  globals: {
    fetch: global.fetch,
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  testTimeout: 50000,
};
