const { Config } = require('@jest/types');

/**
 * @type {Config.InitialOptions}
 */
const config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '\./.+\\.(j|t)sx?$': 'ts-jest'
  },
};

module.exports = config;