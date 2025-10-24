// E2E Test: User Registration Workflow
// Tests the complete user registration flow from auth-service -> user-service -> notification

import { generateTestUser, getUserByEmail, deleteUser } from '../shared/helpers/user.js';
import { registerUser, login } from '../shared/helpers/auth.js';
import axios from 'axios';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const MAILPIT_API_URL = process.env.MAILPIT_API_URL || 'http://localhost:8025/api/v1';

// Helper functions
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clearEmails = async () => {
  try {
    await axios.delete(`${MAILPIT_API_URL}/messages`);
  } catch (error) {
    console.warn('Could not clear emails:', error.message);
  }
};

const getEmailBySubject = async (subject, toEmail) => {
  try {
    const response = await axios.get(`${MAILPIT_API_URL}/messages`);
    const messages = response.data.messages || [];
    return messages.find(
      (msg) => msg.Subject.includes(subject) && msg.To && msg.To.some((to) => to.Address === toEmail)
    );
  } catch (error) {
    console.warn('Could not get emails:', error.message);
    return null;
  }
};

const waitFor = async (fn, options = {}) => {
  const { timeout = 10000, interval = 1000, timeoutMessage = 'Timeout' } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await fn();
    if (result) return result;
    await sleep(interval);
  }

  throw new Error(timeoutMessage);
};

describe('User Registration E2E Workflow', () => {
  let testUser;
  let registrationResponse;
  let userId;
  let token;

  beforeAll(async () => {
    // Clear emails before tests
    await clearEmails();
  });

  afterAll(async () => {
    // Cleanup: Delete test user if created
    if (userId && token) {
      await deleteUser(userId, token);
    }
  });

  it('should complete full user registration workflow', async () => {
    testUser = generateTestUser();
    console.log(`\n📝 Registering user: ${testUser.email}`);

    try {
      registrationResponse = await registerUser(testUser);
    } catch (error) {
      console.error('❌ Registration failed:');
      console.error('  User data:', testUser);
      console.error('  Response:', JSON.stringify(error.response?.data, null, 2));
      console.error('  Status:', error.response?.status);
      throw error;
    }

    expect(registrationResponse).toBeDefined();
    expect(registrationResponse.message).toContain('Registration successful');
    expect(registrationResponse.requiresVerification).toBe(true);
    expect(registrationResponse.user).toBeDefined();
    expect(registrationResponse.user.email).toBe(testUser.email);
    expect(registrationResponse.user._id).toBeDefined();

    userId = registrationResponse.user._id;

    console.log(`✅ User registered with ID: ${userId}`);

    // Note: We skip login here because the user's email is not yet verified.
    // In a real workflow, the user would need to verify their email before logging in.
    // For E2E tests, we can query the user-service directly without authentication.

    // Step 3: Verify user exists in user-service database
    const userInDatabase = await getUserByEmail(testUser.email, null);

    expect(userInDatabase).toBeDefined();
    expect(userInDatabase._id).toBe(userId);
    expect(userInDatabase.email).toBe(testUser.email);
    expect(userInDatabase.firstName).toBe(testUser.firstName);
    expect(userInDatabase.lastName).toBe(testUser.lastName);
    expect(userInDatabase.isActive).toBe(true);

    console.log('✅ User verified in database');

    // Step 4: Wait for welcome email to be sent
    console.log('⏳ Waiting for welcome email...');

    const email = await waitFor(
      async () => {
        await sleep(1000); // Give notification service time to process
        return await getEmailBySubject('Welcome', testUser.email);
      },
      {
        timeout: 15000,
        interval: 2000,
        timeoutMessage: 'Welcome email not received within timeout',
      }
    );

    expect(email).toBeDefined();
    expect(email.Subject).toContain('Welcome');
    expect(email.To).toBeDefined();
    expect(email.To.some((to) => to.Address === testUser.email)).toBe(true);

    console.log('✅ Welcome email received');
    console.log(`   Subject: ${email.Subject}`);
    console.log(`   To: ${email.To.map((to) => to.Address).join(', ')}`);
  }, 30000);

  it('should prevent duplicate user registration', async () => {
    // Attempt to register the same user again
    try {
      await registerUser(testUser);
      fail('Should have thrown an error for duplicate registration');
    } catch (error) {
      expect(error.response).toBeDefined();
      // Auth service may return 400, 409, or 429 (rate limit)
      expect([400, 409, 429]).toContain(error.response.status);
      console.log('✅ Duplicate registration prevented (or rate limited)');
      console.log(`   Status: ${error.response.status}`);
    }
  });

  it('should validate required fields during registration', async () => {
    const invalidUser = {
      email: 'invalid-email',
      password: '123', // Too short
      firstName: '',
      lastName: '',
    };

    try {
      await registerUser(invalidUser);
      fail('Should have thrown validation error');
    } catch (error) {
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(400); // Bad Request
      console.log('✅ Validation errors caught');
    }
  });
});
