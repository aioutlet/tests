/**
 * Smoke Tests - Authentication Flow
 * Critical path: User can register
 * Run on every commit
 */
import axios from 'axios';
import { generateTestUser } from '../shared/fixtures/users.js';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

describe('Critical Authentication Flow', () => {
  jest.setTimeout(5000);

  let testUser;
  let userId;

  afterAll(async () => {
    // Note: Cleanup handled by tests infrastructure
  });

  it('should be able to register a user', async () => {
    testUser = generateTestUser();

    const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, testUser);

    expect(response.status).toBe(201);
    expect(response.data.user).toBeDefined();
    expect(response.data.user.email).toBe(testUser.email);

    userId = response.data.user._id;

    console.log(`✅ User registration works (ID: ${userId})`);
  });

  it('should reject invalid registration', async () => {
    const invalidUser = { email: 'invalid', password: '123' };

    try {
      await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, invalidUser);
      fail('Should have rejected invalid registration');
    } catch (error) {
      expect(error.response.status).toBe(400);
      console.log('✅ Input validation works');
    }
  });
});
