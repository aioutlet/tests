/**
 * Global Test Setup
 * Runs once before all tests
 */
import dotenv from 'dotenv';
import { waitForService } from '../helpers/api.js';

// Load environment variables
dotenv.config();

// Set default test timeout
jest.setTimeout(parseInt(process.env.TEST_TIMEOUT || '30000'));

// Services to wait for
const services = [
  { name: 'Auth Service', url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001' },
  { name: 'User Service', url: process.env.USER_SERVICE_URL || 'http://localhost:3002' },
  { name: 'Message Broker', url: process.env.MESSAGE_BROKER_SERVICE_URL || 'http://localhost:4000' },
];

// Global setup - runs once before all tests
beforeAll(async () => {
  console.log('\n🚀 Starting AIOutlet Test Suite...\n');
  console.log('Environment: %s', process.env.NODE_ENV || 'test');
  console.log('\nService URLs:');

  console.log(`  - Auth Service: ${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}`);
  console.log(`  - User Service: ${process.env.USER_SERVICE_URL || 'http://localhost:3002'}`);
  console.log(`  - Message Broker: ${process.env.MESSAGE_BROKER_SERVICE_URL || 'http://localhost:4000'}`);
  console.log(`  - Notification Service: ${process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003'}`);
  console.log(`  - Order Service: ${process.env.ORDER_SERVICE_URL || 'http://localhost:5088'}`);

  console.log('\n⏳ Waiting for services to be ready...\n');

  // Wait for critical services
  for (const service of services) {
    try {
      await waitForService(service.url, {
        timeout: parseInt(process.env.SERVICE_STARTUP_TIMEOUT || '60000'),
        interval: 2000,
        serviceName: service.name,
      });
    } catch (error) {
      console.error(`❌ ${service.name} failed to start: ${error.message}`);
      // Don't throw - let individual tests fail if service is down
    }
  }

  console.log('\n✅ Service check complete!\n');
});

// Global teardown - runs once after all tests
afterAll(async () => {
  console.log('\n✅ Test Suite Complete!\n');

  // Cleanup logic here if needed
  if (process.env.CLEANUP_AFTER_TESTS === 'true') {
    console.log('Performing cleanup...');
    // Add cleanup code here
  }
});

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Suppress specific warnings if needed
const originalWarn = console.warn;
console.warn = (...args) => {
  // Filter out specific warnings
  const message = args[0]?.toString() || '';
  if (message.includes('deprecated') && process.env.SUPPRESS_DEPRECATION_WARNINGS === 'true') {
    return;
  }
  originalWarn.apply(console, args);
};
