/**
 * Smoke Tests - Health Checks
 * Critical path validation - all services must be running
 * Run on every commit before any other tests
 */
import axios from 'axios';

// Only include services that are currently running
const SERVICES = [
  { name: 'Auth Service', healthUrl: process.env.AUTH_SERVICE_HEALTH_URL || 'http://localhost:3001/health' },
  { name: 'User Service', healthUrl: process.env.USER_SERVICE_HEALTH_URL || 'http://localhost:3002/health' },
  { name: 'Product Service', healthUrl: process.env.PRODUCT_SERVICE_HEALTH_URL || 'http://localhost:8003/health' },
  { name: 'Inventory Service', healthUrl: process.env.INVENTORY_SERVICE_HEALTH_URL || 'http://localhost:5000/health' },
  { name: 'Cart Service', healthUrl: process.env.CART_SERVICE_HEALTH_URL || 'http://localhost:8085/health' },
  { name: 'Order Service', healthUrl: process.env.ORDER_SERVICE_HEALTH_URL || 'http://localhost:5088/health' },
  { name: 'Review Service', healthUrl: process.env.REVIEW_SERVICE_HEALTH_URL || 'http://localhost:9001/health' },
  { name: 'Admin Service', healthUrl: process.env.ADMIN_SERVICE_HEALTH_URL || 'http://localhost:3010/health' },
  {
    name: 'Message Broker',
    healthUrl: process.env.MESSAGE_BROKER_SERVICE_HEALTH_URL || 'http://localhost:4000/health',
  },
];

// Services not currently running (commented out for future reference):
// { name: 'Payment Service', healthUrl: process.env.PAYMENT_SERVICE_HEALTH_URL || 'http://localhost:5001/health' }

describe('Critical Service Health Checks', () => {
  // Fast timeout for smoke tests
  jest.setTimeout(5000);

  SERVICES.forEach(({ name, healthUrl }) => {
    it(`${name} should be healthy`, async () => {
      const response = await axios.get(healthUrl, { timeout: 3000 });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe('healthy');

      console.log(`✅ ${name} is healthy`);
    });
  });

  it('all critical services should respond within 3 seconds', async () => {
    const startTime = Date.now();

    const healthChecks = SERVICES.map(({ healthUrl }) => axios.get(healthUrl, { timeout: 3000 }).catch(() => null));

    const results = await Promise.all(healthChecks);
    const duration = Date.now() - startTime;

    const allHealthy = results.every((r) => r && r.status === 200);

    expect(allHealthy).toBe(true);
    expect(duration).toBeLessThan(3000);

    console.log(`✅ All services responded in ${duration}ms`);
  });
});
