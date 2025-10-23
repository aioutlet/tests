/**
 * Jest Configuration for Smoke Tests
 * Critical path validation - must pass before any deployment
 * Run on every commit, super fast
 */
export default {
  testEnvironment: 'node',
  testTimeout: 5000, // Smoke tests must be very fast
  verbose: true,
  collectCoverageFrom: ['smoke/**/*.js', '!**/*.test.js', '!**/node_modules/**'],
  coverageDirectory: 'coverage/smoke',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/smoke/**/*.smoke.test.js'],
  setupFilesAfterEnv: ['<rootDir>/shared/config/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  maxWorkers: '50%', // Can run in parallel
  bail: true, // Stop immediately on first failure
};
