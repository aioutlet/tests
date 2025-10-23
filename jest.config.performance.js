/**
 * Jest Configuration for Performance Tests
 * Load testing and performance benchmarks
 * Run on-demand or nightly
 */
export default {
  testEnvironment: 'node',
  testTimeout: 120000, // Performance tests can take several minutes
  verbose: true,
  collectCoverageFrom: ['performance/**/*.js', '!**/*.test.js', '!**/node_modules/**'],
  coverageDirectory: 'coverage/performance',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/performance/**/*.perf.test.js'],
  setupFilesAfterEnv: ['<rootDir>/shared/config/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  maxWorkers: 1, // Run sequentially for accurate performance metrics
};
