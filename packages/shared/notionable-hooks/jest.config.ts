/* eslint-disable */
export default {
  displayName: 'shared-notionable-hooks',
  preset: '../../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/packages/shared/notionable-hooks',
  setupFilesAfterEnv: ['../../../setup-jest.ts'],
};
