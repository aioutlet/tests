/**
 * Jest Configuration for E2E Tests
 * Tests cross-service workflows and complete user journeys
 * Run on PR merge
 */
export default {
  testEnvironment: 'node',
  testTimeout: 30000, // E2E tests need more time for cross-service calls
  verbose: true,
  collectCoverageFrom: ['e2e/**/*.js', '!**/*.test.js', '!**/node_modules/**'],
  coverageDirectory: 'coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/e2e/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/shared/config/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  maxWorkers: 1, // Run sequentially to avoid data conflicts
};
