/* eslint-disable */
export default {
  displayName: 'dex-simulator',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/dex-simulator',
  setupFilesAfterEnv: ['../../setup-jest.ts'],
};
