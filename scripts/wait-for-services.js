/**
 * Wait for Services Script
 * Checks that all required services are healthy before running tests
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MAX_RETRIES = 30;
const RETRY_INTERVAL = 2000;

// Services to check
const SERVICES = [
  { url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001', name: 'Auth Service' },
  { url: process.env.USER_SERVICE_URL || 'http://localhost:3002', name: 'User Service' },
  { url: process.env.MESSAGE_BROKER_SERVICE_URL || 'http://localhost:4000', name: 'Message Broker' },
  // Note: notification-service is a consumer-only service with no health endpoint
];

/**
 * Check if a service is healthy
 */
async function checkService(serviceUrl, serviceName) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
      if (response.status === 200) {
        console.log(`✓ ${serviceName} is ready`);
        return true;
      }
    } catch (error) {
      console.log(`⏳ Waiting for ${serviceName}... (attempt ${i + 1}/${MAX_RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    }
  }

  console.error(`✗ ${serviceName} failed to become ready after ${MAX_RETRIES} attempts`);
  return false;
}

/**
 * Wait for all services to be ready
 */
async function waitForServices() {
  console.log('\n🚀 Waiting for services to be ready...\n');

  const results = [];

  for (const service of SERVICES) {
    const isReady = await checkService(service.url, service.name);
    results.push({ service: service.name, ready: isReady });
  }

  const allReady = results.every((r) => r.ready);

  if (allReady) {
    console.log('\n✅ All services are ready!\n');
    process.exit(0);
  } else {
    console.error('\n❌ Some services failed to start:\n');
    results.filter((r) => !r.ready).forEach((r) => console.error(`  - ${r.service}`));
    console.error('\n');
    process.exit(1);
  }
}

// Run the script
waitForServices().catch((error) => {
  console.error('❌ Error waiting for services:', error);
  process.exit(1);
});
