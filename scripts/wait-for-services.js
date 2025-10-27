/**
 * Wait for Services Script
 * Checks that all required services are healthy before running tests
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MAX_RETRIES = 30;
const RETRY_INTERVAL = 2000;

// Automatically read all services from environment variables
const SERVICES = [
  { url: process.env.AUTH_SERVICE_URL, healthUrl: process.env.AUTH_SERVICE_HEALTH_URL, name: 'Auth Service' },
  { url: process.env.USER_SERVICE_URL, healthUrl: process.env.USER_SERVICE_HEALTH_URL, name: 'User Service' },
  { url: process.env.ORDER_SERVICE_URL, healthUrl: process.env.ORDER_SERVICE_HEALTH_URL, name: 'Order Service' },
  {
    url: process.env.MESSAGE_BROKER_SERVICE_URL,
    healthUrl: process.env.MESSAGE_BROKER_SERVICE_HEALTH_URL,
    name: 'Message Broker Service',
  },
  {
    url: process.env.NOTIFICATION_SERVICE_URL,
    healthUrl: process.env.NOTIFICATION_SERVICE_HEALTH_URL,
    name: 'Notification Service',
  },
  { url: process.env.PRODUCT_SERVICE_URL, healthUrl: process.env.PRODUCT_SERVICE_HEALTH_URL, name: 'Product Service' },
  {
    url: process.env.INVENTORY_SERVICE_URL,
    healthUrl: process.env.INVENTORY_SERVICE_HEALTH_URL,
    name: 'Inventory Service',
  },
  { url: process.env.CART_SERVICE_URL, healthUrl: process.env.CART_SERVICE_HEALTH_URL, name: 'Cart Service' },
  { url: process.env.PAYMENT_SERVICE_URL, healthUrl: process.env.PAYMENT_SERVICE_HEALTH_URL, name: 'Payment Service' },
  {
    url: process.env.ORDER_PROCESSOR_SERVICE_URL,
    healthUrl: process.env.ORDER_PROCESSOR_SERVICE_HEALTH_URL,
    name: 'Order Processor Service',
  },
  { url: process.env.REVIEW_SERVICE_URL, healthUrl: process.env.REVIEW_SERVICE_HEALTH_URL, name: 'Review Service' },
  { url: process.env.ADMIN_SERVICE_URL, healthUrl: process.env.ADMIN_SERVICE_HEALTH_URL, name: 'Admin Service' },
  { url: process.env.AUDIT_SERVICE_URL, healthUrl: process.env.AUDIT_SERVICE_HEALTH_URL, name: 'Audit Service' },
].filter((service) => service.url && service.healthUrl); // Only include services that have URLs defined

/**
 * Check if a service is healthy
 */
async function checkService(serviceUrl, healthUrl, serviceName) {
  const checkUrl = healthUrl || `${serviceUrl}/health`;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await axios.get(checkUrl, { timeout: 5000 });
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
    const isReady = await checkService(service.url, service.healthUrl, service.name);
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
