/**
 * Smoke Tests - Critical API Endpoints
 * Validates that critical endpoints are accessible
 * Run on every commit
 */
import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const MESSAGE_BROKER_SERVICE_URL = process.env.MESSAGE_BROKER_SERVICE_URL || 'http://localhost:4000';

describe('Critical API Endpoints', () => {
  jest.setTimeout(5000);

  describe('Auth Service Endpoints', () => {
    it('/health should respond', async () => {
      const response = await axios.get(`${AUTH_SERVICE_URL}/health`);
      expect(response.status).toBe(200);
    });

    it('/api/auth/register should be accessible', async () => {
      try {
        await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, {});
      } catch (error) {
        // We expect validation error, not 404
        expect(error.response.status).not.toBe(404);
        expect([400, 422]).toContain(error.response.status);
      }
      console.log('✅ Register endpoint accessible');
    });

    it('/api/auth/login should be accessible', async () => {
      try {
        await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {});
      } catch (error) {
        // We expect validation error, not 404
        expect(error.response.status).not.toBe(404);
        expect([400, 401, 422]).toContain(error.response.status);
      }
      console.log('✅ Login endpoint accessible');
    });
  });

  describe('User Service Endpoints', () => {
    it('/health should respond', async () => {
      const response = await axios.get(`${USER_SERVICE_URL}/health`);
      expect(response.status).toBe(200);
    });

    it('/api/users endpoint should be accessible', async () => {
      try {
        await axios.get(`${USER_SERVICE_URL}/api/users/test`);
      } catch (error) {
        // We expect 401, 403, or 404, not 500
        expect(error.response.status).not.toBe(500);
        expect([401, 403, 404]).toContain(error.response.status);
      }
      console.log('✅ Users endpoint accessible');
    });
  });

  describe('Message Broker Service Endpoints', () => {
    it('/health should respond', async () => {
      const response = await axios.get(`${MESSAGE_BROKER_SERVICE_URL}/health`);
      expect(response.status).toBe(200);
    });

    it('/api/v1/publish should be accessible', async () => {
      try {
        await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, {});
      } catch (error) {
        // We expect 401 or 400, not 404
        expect(error.response.status).not.toBe(404);
        expect([400, 401]).toContain(error.response.status);
      }
      console.log('✅ Publish endpoint accessible');
    });
  });
});
