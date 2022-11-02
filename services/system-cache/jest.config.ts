/* eslint-disable */
export default {
  displayName: 'system-cache',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: 'services/system-cache/src/index.ts',
    modules: true,
    durableObjects: {
      SYSTEM_CACHE: 'SystemCache',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/services/system-cache',
};
