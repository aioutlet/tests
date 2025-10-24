/**
 * Jest Configuration for API Tests
 * Fast, focused tests for individual service endpoints
 * Run on every commit and PR
 */
export default {
  testEnvironment: 'node',
  testTimeout: 10000, // API tests should be fast
  verbose: false,
  collectCoverageFrom: ['api/**/*.js', '!**/*.test.js', '!**/node_modules/**'],
  coverageDirectory: 'coverage/api',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/api/**/*.api.test.js'],
  setupFilesAfterEnv: ['<rootDir>/shared/config/setup-api.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  maxWorkers: '50%', // API tests can run in parallel
};
