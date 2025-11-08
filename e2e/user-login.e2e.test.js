// E2E Test: User Login Workflow
// Tests user authentication flow

import { generateTestUser, deleteUser } from '../../shared/helpers/user.js';
import { registerUser, login as loginUser } from '../../shared/helpers/auth.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('User Login E2E Workflow', () => {
  let testUser;
  let userId;
  let registrationToken;

  beforeAll(async () => {
    // Note: Login tests are skipped because auth-service requires email verification
    // before login, and we don't have a way to verify emails in E2E tests yet.
    // These tests would need:
    // 1. Email verification endpoint implementation
    // 2. Or direct database access to mark user as verified
    // 3. Or admin endpoint to verify users

    testUser = generateTestUser();
  });

  afterAll(async () => {
    // Cleanup: Delete test user
    if (userId && registrationToken) {
      await deleteUser(userId, registrationToken);
    }
  });

  it.skip('should successfully login with valid credentials (requires email verification)', async () => {
    // Skipped: Auth-service requires email verification before login
    // TODO: Implement email verification flow or admin endpoint to verify users
    console.log('⏭️  Skipped: Requires email verification implementation');
  });

  it.skip('should fail login with invalid password (requires verified user)', async () => {
    console.log('⏭️  Skipped: Requires email verification implementation');
  });

  it('should fail login with non-existent email', async () => {
    try {
      await loginUser('nonexistent@example.com', testUser.password);
      fail('Should have thrown an error for non-existent user');
    } catch (error) {
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(401); // Unauthorized
      console.log('✅ Non-existent user rejected');
    }
  });

  it('should fail login with invalid email format', async () => {
    try {
      await loginUser('invalid-email', testUser.password);
      fail('Should have thrown validation error');
    } catch (error) {
      expect(error.response).toBeDefined();
      // May return 400 (validation) or 401 (not found)
      expect([400, 401]).toContain(error.response.status);
      console.log('✅ Invalid email format rejected');
      console.log(`   Status: ${error.response.status}`);
    }
  });
});
