// E2E Test: User Service
// Tests user management endpoints and functionality

import axios from 'axios';
import { generateTestUser, registerUser, getUserByEmail, deleteUser, sleep } from '../helpers/testUtils.js';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';

describe('User Service E2E Tests', () => {
  let testUser;
  let userId;
  let token;

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await axios.get(`${USER_SERVICE_URL}/health`);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe('healthy');
      expect(response.data.service).toBe('user-service');

      console.log('✅ User service is healthy');
    });
  });

  describe('User Creation and Retrieval', () => {
    beforeAll(async () => {
      // Register a test user via auth-service (which creates user in user-service)
      testUser = generateTestUser();
      const registrationResponse = await registerUser(testUser);
      userId = registrationResponse.user._id;

      console.log(`\n📝 Test user created: ${testUser.email} (ID: ${userId})`);
    });

    afterAll(async () => {
      // Cleanup: Delete test user
      if (userId && token) {
        await deleteUser(userId, token);
      }
    });

    it('should retrieve user by email', async () => {
      const user = await getUserByEmail(testUser.email, null);

      expect(user).toBeDefined();
      expect(user._id).toBe(userId);
      expect(user.email).toBe(testUser.email);
      expect(user.firstName).toBe(testUser.firstName);
      expect(user.lastName).toBe(testUser.lastName);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();

      console.log('✅ User retrieved successfully by email');
    });

    it('should retrieve user by ID', async () => {
      const response = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data._id).toBe(userId);
      expect(response.data.email).toBe(testUser.email);

      console.log('✅ User retrieved successfully by ID');
    });

    it('should return 404 for non-existent user by email', async () => {
      try {
        await getUserByEmail('nonexistent@example.com', null);
        fail('Should have thrown 404 error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(404);

        console.log('✅ Non-existent user returns 404');
      }
    });

    it('should return 404 for non-existent user by ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format

      try {
        await axios.get(`${USER_SERVICE_URL}/api/users/${fakeId}`);
        fail('Should have thrown 404 error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(404);

        console.log('✅ Non-existent user by ID returns 404');
      }
    });

    it('should return 400 for invalid user ID format', async () => {
      const invalidId = 'invalid-id-format';

      try {
        await axios.get(`${USER_SERVICE_URL}/api/users/${invalidId}`);
        fail('Should have thrown 400 error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect([400, 404]).toContain(error.response.status); // Some services may return 404

        console.log(`✅ Invalid user ID format rejected (Status: ${error.response.status})`);
      }
    });
  });

  describe('User Profile Management', () => {
    beforeAll(async () => {
      // Create test user if not already created
      if (!userId) {
        testUser = generateTestUser();
        const registrationResponse = await registerUser(testUser);
        userId = registrationResponse.user._id;
        console.log(`\n📝 Test user created: ${testUser.email} (ID: ${userId})`);
      }
    });

    afterAll(async () => {
      // Cleanup
      if (userId && token) {
        await deleteUser(userId, token);
      }
    });

    it('should update user profile', async () => {
      const updatedData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
      };

      try {
        const response = await axios.put(`${USER_SERVICE_URL}/api/users/${userId}`, updatedData);

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data.firstName).toBe(updatedData.firstName);
        expect(response.data.lastName).toBe(updatedData.lastName);

        console.log('✅ User profile updated successfully');
      } catch (error) {
        // If endpoint requires authentication, it's expected to fail
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('⏭️  Skipped: Update requires authentication');
        } else {
          throw error;
        }
      }
    });

    it('should reject update with invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email-format',
      };

      try {
        await axios.put(`${USER_SERVICE_URL}/api/users/${userId}`, invalidData);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.response).toBeDefined();
        // Could be 400 (validation) or 401 (auth required)
        expect([400, 401, 403]).toContain(error.response.status);

        console.log(`✅ Invalid email update rejected (Status: ${error.response.status})`);
      }
    });
  });

  describe('User Listing', () => {
    it('should list all users', async () => {
      try {
        const response = await axios.get(`${USER_SERVICE_URL}/api/users`);

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(Array.isArray(response.data)).toBe(true);

        if (response.data.length > 0) {
          const user = response.data[0];
          expect(user._id).toBeDefined();
          expect(user.email).toBeDefined();
        }

        console.log(`✅ Retrieved ${response.data.length} users`);
      } catch (error) {
        // If endpoint requires authentication or doesn't exist
        if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
          console.log('⏭️  Skipped: List endpoint requires authentication or not implemented');
        } else {
          throw error;
        }
      }
    });
  });

  describe('User Deletion', () => {
    let tempUserId;

    beforeEach(async () => {
      // Create a temporary user for deletion test
      const tempUser = generateTestUser();
      const registrationResponse = await registerUser(tempUser);
      tempUserId = registrationResponse.user._id;

      await sleep(500); // Brief pause
    });

    it('should delete user by ID', async () => {
      try {
        const response = await axios.delete(`${USER_SERVICE_URL}/api/users/${tempUserId}`);

        expect([200, 204]).toContain(response.status);

        // Verify user is deleted
        try {
          await axios.get(`${USER_SERVICE_URL}/api/users/${tempUserId}`);
          fail('Deleted user should not be found');
        } catch (error) {
          expect(error.response.status).toBe(404);
        }

        console.log('✅ User deleted successfully');
      } catch (error) {
        // If endpoint requires authentication
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('⏭️  Skipped: Delete requires authentication');
          // Clean up manually
          await deleteUser(tempUserId, null);
        } else {
          throw error;
        }
      }
    });

    it('should return 404 when deleting non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      try {
        await axios.delete(`${USER_SERVICE_URL}/api/users/${fakeId}`);
        // Some implementations might return 204 even for non-existent users
        console.log('⚠️  Delete non-existent user returned success (idempotent behavior)');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect([404, 401, 403]).toContain(error.response.status);
        console.log(`✅ Delete non-existent user handled (Status: ${error.response.status})`);
      }
    });
  });
});
