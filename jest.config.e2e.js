/**
 * Jest Configuration for End-to-End Tests
 * Complete user workflows across entire system
 * Run nightly or on release branches
 */
export default {
  testEnvironment: 'node',
  testTimeout: 60000, // E2E tests can take longer
  verbose: true,
  collectCoverageFrom: ['e2e/**/*.js', '!**/*.test.js', '!**/node_modules/**'],
  coverageDirectory: 'coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/e2e/**/*.e2e.test.js'],
  setupFilesAfterEnv: ['<rootDir>/shared/config/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  maxWorkers: 1, // Run sequentially for workflow tests
  bail: true, // Stop on first failure for E2E tests
};
