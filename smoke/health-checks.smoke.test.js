/**
 * Smoke Tests - Health Checks
 * Critical path validation - all services must be running
 * Run on every commit before any other tests
 */
import axios from 'axios';

const SERVICES = [
  { name: 'Auth Service', url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001' },
  { name: 'User Service', url: process.env.USER_SERVICE_URL || 'http://localhost:3002' },
  { name: 'Message Broker', url: process.env.MESSAGE_BROKER_SERVICE_URL || 'http://localhost:4000' },
];

describe('Critical Service Health Checks', () => {
  // Fast timeout for smoke tests
  jest.setTimeout(5000);

  SERVICES.forEach(({ name, url }) => {
    it(`${name} should be healthy`, async () => {
      const response = await axios.get(`${url}/health`, { timeout: 3000 });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe('healthy');

      console.log(`✅ ${name} is healthy`);
    });
  });

  it('all critical services should respond within 3 seconds', async () => {
    const startTime = Date.now();

    const healthChecks = SERVICES.map(({ url }) => axios.get(`${url}/health`, { timeout: 3000 }).catch(() => null));

    const results = await Promise.all(healthChecks);
    const duration = Date.now() - startTime;

    const allHealthy = results.every((r) => r && r.status === 200);

    expect(allHealthy).toBe(true);
    expect(duration).toBeLessThan(3000);

    console.log(`✅ All services responded in ${duration}ms`);
  });
});
