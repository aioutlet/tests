/**
 * Authentication Helper
 * Provides authentication utilities for tests
 */
import { post, get } from './api.js';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';

/**
 * Register a new user
 */
export async function register(userData) {
  const response = await post(`${AUTH_SERVICE_URL}/api/auth/register`, userData);
  return response;
}

/**
 * Login user and get JWT token
 */
export async function login(email, password) {
  const response = await post(`${AUTH_SERVICE_URL}/api/auth/login`, { email, password });
  return response;
}

/**
 * Get auth token for a user (register + login)
 */
export async function getAuthToken(userData) {
  // Register user
  const registerResponse = await register(userData);
  if (registerResponse.status !== 201) {
    throw new Error(`Failed to register user: ${registerResponse.status}`);
  }

  // Login user
  const loginResponse = await login(userData.email, userData.password);
  if (loginResponse.status !== 200) {
    throw new Error(`Failed to login user: ${loginResponse.status}`);
  }

  return loginResponse.data.token;
}

/**
 * Create test user and get token in one step
 */
export async function createAuthenticatedUser(email, password = 'Test@123456', firstName = 'Test', lastName = 'User') {
  const userData = { email, password, firstName, lastName };
  const token = await getAuthToken(userData);

  // Get user details
  const userResponse = await get(`${USER_SERVICE_URL}/api/users/findByEmail?email=${encodeURIComponent(email)}`, {
    token,
  });

  return {
    user: userResponse.data,
    token,
  };
}

/**
 * Verify JWT token
 */
export async function verifyToken(token) {
  const response = await get(`${AUTH_SERVICE_URL}/api/auth/verify`, { token });
  return response;
}

/**
 * Delete user (cleanup)
 */
export async function deleteUser(userId, token) {
  const response = await post(`${USER_SERVICE_URL}/api/users/${userId}`, {}, { token });
  return response;
}

export default {
  register,
  login,
  getAuthToken,
  createAuthenticatedUser,
  verifyToken,
  deleteUser,
};
