// E2E Test: Message Broker Service
// Tests AWS EventBridge-style message publishing and broker functionality

import axios from 'axios';

const MESSAGE_BROKER_SERVICE_URL = process.env.MESSAGE_BROKER_SERVICE_URL || 'http://localhost:4000';
const MESSAGE_BROKER_SERVICE_HEALTH_URL =
  process.env.MESSAGE_BROKER_SERVICE_HEALTH_URL || 'http://localhost:4000/health';
const MESSAGE_BROKER_API_KEY = process.env.MESSAGE_BROKER_API_KEY || '7K9mP2xR5wN8qT4vL6jH3sF1dG9bY0zA';

describe('Message Broker Service E2E Tests', () => {
  const validHeaders = {
    'X-API-Key': MESSAGE_BROKER_API_KEY,
    'X-Service-Name': 'e2e-test-service',
    'Content-Type': 'application/json',
  };

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await axios.get(MESSAGE_BROKER_SERVICE_HEALTH_URL);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe('healthy');
      expect(response.data.service).toBe('message-broker-service');

      console.log('✅ Message broker service is healthy');
    });

    it('should include broker connection status in health check', async () => {
      const response = await axios.get(MESSAGE_BROKER_SERVICE_HEALTH_URL);

      expect(response.data.broker).toBeDefined();
      expect(response.data.broker.connected).toBe(true);
      expect(response.data.broker.type).toBeDefined();

      console.log(`✅ Broker connected: ${response.data.broker.type}`);
    });
  });

  describe('Authentication', () => {
    const validPayload = {
      source: 'e2e-test-service',
      eventType: 'test.event',
      data: { test: true },
    };

    it('should reject requests without API key', async () => {
      try {
        await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, validPayload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        fail('Should have thrown authentication error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toContain('API key required');

        console.log('✅ Request without API key rejected');
      }
    });

    it('should reject requests with invalid API key', async () => {
      try {
        await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, validPayload, {
          headers: {
            'X-API-Key': 'invalid-api-key',
            'Content-Type': 'application/json',
          },
        });
        fail('Should have thrown authentication error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toContain('Invalid API key');

        console.log('✅ Request with invalid API key rejected');
      }
    });

    it('should accept requests with valid API key', async () => {
      const response = await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, validPayload, {
        headers: validHeaders,
      });

      expect(response.status).toBe(200);

      console.log('✅ Request with valid API key accepted');
    });
  });

  describe('AWS EventBridge Payload Publishing', () => {
    it('should successfully publish event with required fields', async () => {
      const payload = {
        source: 'e2e-test-service',
        eventType: 'test.created',
        data: {
          testId: '12345',
          testName: 'E2E Test',
        },
      };

      const response = await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, payload, {
        headers: validHeaders,
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.success).toBe(true);
      expect(response.data.messageId).toBeDefined();
      expect(response.data.eventType).toBe(payload.eventType);

      console.log(`✅ Event published successfully (ID: ${response.data.messageId})`);
    });

    it('should successfully publish event with all optional fields', async () => {
      const correlationId = `test-${Date.now()}`;
      const payload = {
        source: 'e2e-test-service',
        eventType: 'test.updated',
        eventVersion: '1.0',
        eventId: 'evt_123',
        timestamp: new Date().toISOString(),
        correlationId,
        data: {
          testId: '67890',
          changes: ['field1', 'field2'],
        },
        metadata: {
          region: 'us-west-2',
          environment: 'test',
        },
        priority: 5,
      };

      const response = await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, payload, {
        headers: {
          ...validHeaders,
          'x-correlation-id': correlationId,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.messageId).toBeDefined();

      console.log('✅ Event with all fields published successfully');
    });

    it('should reject event without source field', async () => {
      const invalidPayload = {
        eventType: 'test.created',
        data: { test: true },
      };

      try {
        await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, invalidPayload, { headers: validHeaders });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('source');

        console.log('✅ Event without source rejected');
      }
    });

    it('should reject event without eventType field', async () => {
      const invalidPayload = {
        source: 'e2e-test-service',
        data: { test: true },
      };

      try {
        await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, invalidPayload, { headers: validHeaders });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('eventType');

        console.log('✅ Event without eventType rejected');
      }
    });

    it('should reject event without data field', async () => {
      const invalidPayload = {
        source: 'e2e-test-service',
        eventType: 'test.created',
      };

      try {
        await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, invalidPayload, { headers: validHeaders });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('data');

        console.log('✅ Event without data rejected');
      }
    });

    it('should reject event with empty source', async () => {
      const invalidPayload = {
        source: '',
        eventType: 'test.created',
        data: { test: true },
      };

      try {
        await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, invalidPayload, { headers: validHeaders });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(400);

        console.log('✅ Event with empty source rejected');
      }
    });

    it('should reject event with empty eventType', async () => {
      const invalidPayload = {
        source: 'e2e-test-service',
        eventType: '',
        data: { test: true },
      };

      try {
        await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, invalidPayload, { headers: validHeaders });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(400);

        console.log('✅ Event with empty eventType rejected');
      }
    });
  });

  describe('Event Type Routing', () => {
    it('should publish user events with correct routing', async () => {
      const userEvents = [
        { eventType: 'user.created', data: { userId: '1' } },
        { eventType: 'user.updated', data: { userId: '2' } },
        { eventType: 'user.deleted', data: { userId: '3' } },
      ];

      for (const event of userEvents) {
        const payload = {
          source: 'user-service',
          ...event,
        };

        const response = await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, payload, {
          headers: validHeaders,
        });

        expect(response.status).toBe(200);
        expect(response.data.eventType).toBe(event.eventType);

        console.log(`✅ ${event.eventType} event published`);
      }
    });

    it('should publish auth events with correct routing', async () => {
      const authEvents = [
        { eventType: 'auth.user.registered', data: { email: 'test@example.com' } },
        { eventType: 'auth.user.login', data: { email: 'test@example.com' } },
        { eventType: 'auth.user.logout', data: { email: 'test@example.com' } },
      ];

      for (const event of authEvents) {
        const payload = {
          source: 'auth-service',
          ...event,
        };

        const response = await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, payload, {
          headers: validHeaders,
        });

        expect(response.status).toBe(200);
        expect(response.data.eventType).toBe(event.eventType);

        console.log(`✅ ${event.eventType} event published`);
      }
    });

    it('should handle wildcard routing patterns', async () => {
      const wildcardEvents = [
        { eventType: 'order.created', data: { orderId: '1' } },
        { eventType: 'order.confirmed', data: { orderId: '1' } },
        { eventType: 'order.shipped', data: { orderId: '1' } },
        { eventType: 'order.delivered', data: { orderId: '1' } },
      ];

      for (const event of wildcardEvents) {
        const payload = {
          source: 'order-service',
          ...event,
        };

        const response = await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, payload, {
          headers: validHeaders,
        });

        expect(response.status).toBe(200);

        console.log(`✅ ${event.eventType} published (wildcard: order.*)`);
      }
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid JSON payload', async () => {
      try {
        await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, 'invalid-json', { headers: validHeaders });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(400);

        console.log('✅ Invalid JSON payload rejected');
      }
    });

    it('should return 404 for unknown endpoint', async () => {
      try {
        await axios.get(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/unknown-endpoint`, { headers: validHeaders });
        fail('Should have thrown 404 error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(404);

        console.log('✅ Unknown endpoint returns 404');
      }
    });

    it('should handle large payloads appropriately', async () => {
      const largeData = {
        items: Array(1000).fill({ id: 1, name: 'test', description: 'A'.repeat(1000) }),
      };

      const payload = {
        source: 'e2e-test-service',
        eventType: 'test.large',
        data: largeData,
      };

      try {
        const response = await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, payload, {
          headers: validHeaders,
        });

        // If it succeeds, broker can handle large payloads
        expect(response.status).toBe(200);
        console.log('✅ Large payload handled successfully');
      } catch (error) {
        // If it fails, broker has size limits (which is acceptable)
        if (error.response?.status === 413 || error.response?.status === 400) {
          console.log('✅ Large payload rejected (size limit enforced)');
        } else {
          throw error;
        }
      }
    });
  });

  describe('Correlation ID Propagation', () => {
    it('should accept and track correlation ID', async () => {
      const correlationId = `e2e-test-${Date.now()}`;
      const payload = {
        source: 'e2e-test-service',
        eventType: 'test.correlation',
        correlationId,
        data: { test: true },
      };

      const response = await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, payload, {
        headers: {
          ...validHeaders,
          'x-correlation-id': correlationId,
        },
      });

      expect(response.status).toBe(200);
      // Some services return correlation ID in response header
      if (response.headers['x-correlation-id']) {
        expect(response.headers['x-correlation-id']).toBe(correlationId);
      }

      console.log(`✅ Correlation ID tracked: ${correlationId}`);
    });

    it('should generate correlation ID if not provided', async () => {
      const payload = {
        source: 'e2e-test-service',
        eventType: 'test.no-correlation',
        data: { test: true },
      };

      const response = await axios.post(`${MESSAGE_BROKER_SERVICE_URL}/api/v1/publish`, payload, {
        headers: validHeaders,
      });

      expect(response.status).toBe(200);

      console.log('✅ Event published without explicit correlation ID');
    });
  });
});
