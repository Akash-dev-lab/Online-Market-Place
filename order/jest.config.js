/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    testMatch: [ '**/tests/**/*.test.js' ],
    setupFilesAfterEnv: [ '<rootDir>/setup.js' ],
    collectCoverageFrom: [ 'src/**/*.js', '!src/**/index.js' ],
    verbose: true,
};