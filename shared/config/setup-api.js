/**
 * API Test Setup
 * Minimal setup for API tests - no service health checks
 */
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set default test timeout
jest.setTimeout(parseInt(process.env.TEST_TIMEOUT || '30000'));

// Suppress console logs during tests unless VERBOSE=true
if (process.env.VERBOSE !== 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  };
}

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
