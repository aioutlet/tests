/**
 * Performance Test - Auth Service Load
 * Tests authentication service under load
 * Run on-demand or nightly
 */
import axios from 'axios';
import { generateTestUser } from '../shared/fixtures/users.js';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const CONCURRENT_USERS = parseInt(process.env.PERF_CONCURRENT_USERS || '10');
const TEST_DURATION_SECONDS = parseInt(process.env.PERF_TEST_DURATION_SECONDS || '30');

describe('Auth Service Performance Tests', () => {
  jest.setTimeout(120000); // 2 minutes

  it('should handle concurrent registrations', async () => {
    console.log(`\n🚀 Load Test: ${CONCURRENT_USERS} concurrent registrations\n`);

    const startTime = Date.now();
    const users = Array.from({ length: CONCURRENT_USERS }, () => generateTestUser());

    const registrations = users.map((user) =>
      axios
        .post(`${AUTH_SERVICE_URL}/api/auth/register`, user)
        .then((response) => ({
          success: true,
          status: response.status,
          duration: Date.now() - startTime,
        }))
        .catch((error) => ({
          success: false,
          status: error.response?.status || 500,
          duration: Date.now() - startTime,
        }))
    );

    const results = await Promise.all(registrations);
    const duration = Date.now() - startTime;

    // Analyze results
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const maxDuration = Math.max(...results.map((r) => r.duration));
    const minDuration = Math.min(...results.map((r) => r.duration));

    console.log('📊 Performance Metrics:');
    console.log(`   Total Requests: ${CONCURRENT_USERS}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total Duration: ${duration}ms`);
    console.log(`   Average Response Time: ${averageDuration.toFixed(2)}ms`);
    console.log(`   Min Response Time: ${minDuration}ms`);
    console.log(`   Max Response Time: ${maxDuration}ms`);
    console.log(`   Requests/Second: ${((CONCURRENT_USERS / duration) * 1000).toFixed(2)}\n`);

    // Performance assertions
    expect(successful).toBeGreaterThan(CONCURRENT_USERS * 0.9); // 90% success rate
    expect(averageDuration).toBeLessThan(5000); // Average < 5s
    expect(maxDuration).toBeLessThan(10000); // Max < 10s
  });

  it('should maintain performance under sustained load', async () => {
    console.log(`\n🚀 Sustained Load Test: ${TEST_DURATION_SECONDS} seconds\n`);

    const startTime = Date.now();
    const results = [];
    let requestCount = 0;

    while (Date.now() - startTime < TEST_DURATION_SECONDS * 1000) {
      const user = generateTestUser();
      const requestStart = Date.now();

      try {
        await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, user);
        results.push({
          success: true,
          duration: Date.now() - requestStart,
        });
      } catch (error) {
        results.push({
          success: false,
          duration: Date.now() - requestStart,
        });
      }

      requestCount++;

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const totalDuration = Date.now() - startTime;
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const avgResponseTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    console.log('📊 Sustained Load Metrics:');
    console.log(`   Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`   Total Requests: ${requestCount}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Throughput: ${(requestCount / (totalDuration / 1000)).toFixed(2)} req/s\n`);

    // Performance assertions
    expect(successful).toBeGreaterThan(requestCount * 0.8); // 80% success rate
    expect(avgResponseTime).toBeLessThan(2000); // Average < 2s
  });

  it.skip('should handle stress test (high load)', async () => {
    // Stress test with very high concurrent load
    // Skipped by default to avoid overwhelming services
    console.log('⏭️  Skipped: Stress test requires explicit execution');
  });
});
