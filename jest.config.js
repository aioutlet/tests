/**
 * Base Jest Configuration
 * Used for running all tests or as base for specific test configs
 */
export default {
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: false,
  collectCoverageFrom: [
    'api/**/*.js',
    'integration/**/*.js',
    'e2e/**/*.js',
    'smoke/**/*.js',
    'shared/**/*.js',
    '!**/*.test.js',
    '!**/*.spec.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/api/**/*.test.js', '**/integration/**/*.test.js', '**/e2e/**/*.test.js', '**/smoke/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/shared/config/setup-api.js'], // Use minimal setup by default
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  maxWorkers: '50%',
};
