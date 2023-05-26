const nxPreset = require('@nrwl/jest/preset').default;

module.exports = { ...nxPreset, setupFilesAfterEnv: ['../../setup-jest.ts'] };
