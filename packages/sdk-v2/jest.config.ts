/* eslint-disable */
export default {
  displayName: 'sdk-v2',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/tests/unit/**/+(*.)+(spec|test).+(ts|js)?(x)',
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/sdk-v2',
};
