/**
 * Jest Configuration for Integration Tests
 * Tests multi-service interactions and data flow
 * Run on PR merge
 */
export default {
  testEnvironment: 'node',
  testTimeout: 20000, // Integration tests need more time
  verbose: true,
  collectCoverageFrom: ['integration/**/*.js', '!**/*.test.js', '!**/node_modules/**'],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/integration/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/shared/config/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  maxWorkers: 1, // Run sequentially to avoid data conflicts
};
