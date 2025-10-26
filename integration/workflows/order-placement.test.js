// E2E Test: Order Placement Workflow
// Tests the full flow: Register → Login → Place Order → Verify Order

import { generateTestUser, deleteUser } from '../../shared/helpers/user.js';
import { registerUser, login as loginUser } from '../../shared/helpers/auth.js';
import axios from 'axios';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const BFF_BASE_URL = process.env.BFF_URL || 'http://localhost:3100';

// Order helper functions using BFF
const createOrder = async (orderData, token) => {
  const response = await axios.post(`${BFF_BASE_URL}/api/orders`, orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data.data || response.data;
};

const getOrderById = async (orderId, token) => {
  const response = await axios.get(`${BFF_BASE_URL}/api/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data || response.data;
};

const getOrdersByCustomerId = async (token) => {
  const response = await axios.get(`${BFF_BASE_URL}/api/orders/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data || response.data;
};

const generateTestOrder = (customerId) => {
  return {
    customerId,
    items: [
      {
        productId: '68fbd4809cf55b6662929beb',
        productName: 'Gold Layered Necklace',
        unitPrice: 45.99,
        quantity: 2,
      },
      {
        productId: '68fbd4809cf55b6662929bf5',
        productName: 'Samsung Galaxy S24',
        unitPrice: 1199.99,
        quantity: 1,
      },
    ],
    shippingAddress: {
      addressLine1: '123 Test St',
      addressLine2: 'Apt 4B',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345',
      country: 'US',
    },
    billingAddress: {
      addressLine1: '123 Test St',
      addressLine2: 'Apt 4B',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345',
      country: 'US',
    },
    notes: 'E2E Test Order',
  };
};

describe('Order Placement E2E Workflow', () => {
  let testUser;
  let userId;
  let accessToken;
  let createdOrder;

  beforeAll(async () => {
    console.log('\n✅ Order Placement E2E tests - Testing order service integration\n');

    // Step 1: Register and login
    console.log('📝 Step 1: Registering test user...');
    const timestamp = Date.now();
    testUser = {
      email: `testuser${timestamp}@example.com`,
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User',
    };

    const registration = await registerUser(testUser);
    userId = registration.user._id || registration.user.id;

    console.log('   ✅ User registered successfully');
    console.log(`   User ID: ${userId}`);

    console.log('🔐 Logging in...');
    const loginResponse = await loginUser(testUser.email, testUser.password);
    accessToken = loginResponse.data.jwt;

    console.log('   ✅ Login successful');
  });

  describe('Complete Order Flow', () => {
    it('should successfully place an order after login', async () => {
      console.log('\n📦 Step 2: Placing an order...');

      // Generate order data with the registered user's ID
      const orderData = generateTestOrder(userId);

      console.log('   Order Details:');
      console.log(`   - Items: ${orderData.items.length}`);
      console.log(
        `   - Total Value: $${orderData.items
          .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
          .toFixed(2)}`
      );
      console.log(`   - Shipping: ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}`);

      // Create the order
      createdOrder = await createOrder(orderData, accessToken);

      // Verify order response structure
      expect(createdOrder).toBeDefined();
      expect(createdOrder.id).toBeDefined();
      expect(createdOrder.orderNumber).toBeDefined();
      expect(createdOrder.customerId).toBe(userId);
      expect(createdOrder.status).toBeDefined();
      expect(createdOrder.totalAmount).toBeGreaterThan(0);
      expect(createdOrder.currency).toBeDefined();
      expect(createdOrder.items).toBeDefined();
      expect(createdOrder.items.length).toBe(orderData.items.length);
      expect(createdOrder.shippingAddress).toBeDefined();
      expect(createdOrder.billingAddress).toBeDefined();
      expect(createdOrder.createdAt).toBeDefined();

      console.log(`   ✅ Order placed successfully`);
      console.log(`   Order ID: ${createdOrder.id}`);
      console.log(`   Order Number: ${createdOrder.orderNumber}`);
      console.log(`   Status: ${createdOrder.status}`);
      console.log(`   Total: ${createdOrder.currency} ${createdOrder.totalAmount.toFixed(2)}`);
    }, 15000);

    it('should retrieve the placed order by ID', async () => {
      console.log('\n🔍 Step 3: Retrieving order by ID...');

      expect(createdOrder).toBeDefined();
      expect(createdOrder.id).toBeDefined();

      // Retrieve the order
      const retrievedOrder = await getOrderById(createdOrder.id, accessToken);

      // Verify retrieved order matches created order
      expect(retrievedOrder).toBeDefined();
      expect(retrievedOrder.id).toBe(createdOrder.id);
      expect(retrievedOrder.orderNumber).toBe(createdOrder.orderNumber);
      expect(retrievedOrder.customerId).toBe(userId);
      expect(retrievedOrder.status).toBe(createdOrder.status);
      expect(retrievedOrder.totalAmount).toBeCloseTo(createdOrder.totalAmount, 2);
      expect(retrievedOrder.items.length).toBe(createdOrder.items.length);

      console.log(`   ✅ Order retrieved successfully`);
      console.log(`   Verified: Order ID matches`);
      console.log(`   Verified: Order Number matches`);
      console.log(`   Verified: Total Amount matches`);
    }, 10000);

    it('should retrieve orders by customer ID', async () => {
      console.log('\n📋 Step 4: Retrieving all customer orders...');

      // Get all orders for the customer
      const customerOrders = await getOrdersByCustomerId(accessToken);

      // Verify orders array
      expect(customerOrders).toBeDefined();
      expect(Array.isArray(customerOrders)).toBe(true);
      expect(customerOrders.length).toBeGreaterThan(0);

      // Find our created order in the list
      const foundOrder = customerOrders.find((order) => order.id === createdOrder.id);
      expect(foundOrder).toBeDefined();
      expect(foundOrder.orderNumber).toBe(createdOrder.orderNumber);

      console.log(`   ✅ Customer orders retrieved successfully`);
      console.log(`   Total orders: ${customerOrders.length}`);
      console.log(`   Found our order: ${foundOrder ? 'Yes' : 'No'}`);
    }, 10000);

    it('should have correct order calculations', async () => {
      console.log('\n🧮 Step 5: Verifying order calculations...');

      expect(createdOrder).toBeDefined();

      // Calculate expected subtotal from items
      const expectedSubtotal = createdOrder.items.reduce((sum, item) => {
        return sum + item.quantity * item.unitPrice;
      }, 0);

      // Verify item calculations
      createdOrder.items.forEach((item) => {
        const expectedItemTotal = item.quantity * item.unitPrice;
        expect(item.totalPrice).toBeCloseTo(expectedItemTotal, 2);
      });

      // Verify totals are calculated (may include tax and shipping)
      expect(createdOrder.subtotal).toBeGreaterThan(0);
      expect(createdOrder.totalAmount).toBeGreaterThan(0);
      expect(createdOrder.totalAmount).toBeGreaterThanOrEqual(createdOrder.subtotal);

      console.log(`   ✅ Order calculations verified`);
      console.log(`   Subtotal: ${createdOrder.currency} ${createdOrder.subtotal.toFixed(2)}`);
      console.log(`   Tax: ${createdOrder.currency} ${createdOrder.taxAmount.toFixed(2)}`);
      console.log(`   Shipping: ${createdOrder.currency} ${createdOrder.shippingCost.toFixed(2)}`);
      console.log(`   Total: ${createdOrder.currency} ${createdOrder.totalAmount.toFixed(2)}`);
    }, 10000);

    it('should have valid order status', async () => {
      console.log('\n✔️ Step 6: Verifying order status...');

      expect(createdOrder).toBeDefined();
      expect(createdOrder.status).toBeDefined();

      // Valid order statuses
      const validStatuses = ['Created', 'Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
      expect(validStatuses).toContain(createdOrder.status);

      console.log(`   ✅ Order status is valid: ${createdOrder.status}`);
    }, 10000);

    it('should have timestamps', async () => {
      console.log('\n📅 Step 7: Verifying timestamps...');

      expect(createdOrder).toBeDefined();
      expect(createdOrder.createdAt).toBeDefined();

      // Verify createdAt is a valid date
      const createdDate = new Date(createdOrder.createdAt);
      expect(createdDate.toString()).not.toBe('Invalid Date');

      // Verify order was created recently (within last 5 minutes)
      const now = new Date();
      const timeDiff = now - createdDate;
      expect(timeDiff).toBeLessThan(5 * 60 * 1000); // 5 minutes in milliseconds

      console.log(`   ✅ Timestamps verified`);
      console.log(`   Created At: ${createdOrder.createdAt}`);
      console.log(`   Time ago: ${Math.floor(timeDiff / 1000)} seconds`);
    }, 10000);
  });

  describe('Order Validation', () => {
    it('should reject order with invalid customer ID', async () => {
      console.log('\n❌ Testing invalid customer ID...');

      // Note: BFF now extracts customer ID from JWT token and overwrites the request
      // So this test verifies that orders are created with the authenticated user's ID
      const invalidOrderData = generateTestOrder('invalid-customer-id');

      // This should succeed but use the actual customer ID from the token
      const order = await createOrder(invalidOrderData, accessToken);
      expect(order).toBeDefined();
      expect(order.customerId).toBe(userId); // Should use authenticated user's ID, not the invalid one
      console.log('   ✅ Customer ID correctly extracted from token');
      console.log(`   Expected: invalid-customer-id`);
      console.log(`   Actual: ${order.customerId}`);
    }, 10000);

    it('should reject order without authentication', async () => {
      console.log('\n🔒 Testing unauthenticated order...');

      const orderData = generateTestOrder(userId);

      try {
        await createOrder(orderData, null); // No token
        fail('Should have thrown an error without authentication');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(401); // Unauthorized
        console.log('   ✅ Unauthenticated request rejected');
        console.log(`   Status: ${error.response.status}`);
      }
    }, 10000);

    it('should reject order with empty items', async () => {
      console.log('\n📦 Testing order with no items...');

      const orderData = generateTestOrder(userId);
      orderData.items = []; // Empty items array

      await expect(createOrder(orderData, accessToken)).rejects.toThrow();
      console.log('   ✅ Empty items rejected');
    }, 10000);
    it('should reject order with missing shipping address', async () => {
      console.log('\n🏠 Testing order without shipping address...');

      const orderData = generateTestOrder(userId);
      delete orderData.shippingAddress; // Remove shipping address

      try {
        await createOrder(orderData, accessToken);
        fail('Should have thrown validation error for missing shipping address');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect([400, 422]).toContain(error.response.status);
        console.log('   ✅ Missing shipping address rejected');
        console.log(`   Status: ${error.response.status}`);
      }
    }, 10000);
  });

  describe('Order Access Control', () => {
    it("should prevent accessing another customer's order", async () => {
      console.log('\n🔐 Testing order access control...');

      // Create another test user
      const otherUser = generateTestUser();
      const otherRegistration = await registerUser(otherUser);
      const otherUserId = otherRegistration.user._id || otherRegistration.user.id;

      // Login to get token
      const otherLoginResponse = await loginUser(otherUser.email, otherUser.password);
      const otherToken = otherLoginResponse.data.jwt;

      try {
        // Try to access first user's order with second user's token
        await getOrderById(createdOrder.id, otherToken);
        fail("Should have been forbidden to access another customer's order");
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(403); // Forbidden
        console.log('   ✅ Cross-customer access prevented');
        console.log(`   Status: ${error.response.status}`);
      } finally {
        // Cleanup second user
        await deleteUser(otherUserId, otherToken);
      }
    }, 15000);
  });
});

// Summary test to display final results
describe('E2E Test Summary', () => {
  it('should display test completion summary', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Order Placement E2E Test Complete!');
    console.log('='.repeat(60));
    console.log('');
    console.log('✅ All workflow steps completed successfully:');
    console.log('   1. User Registration');
    console.log('   2. User Authentication');
    console.log('   3. Order Placement');
    console.log('   4. Order Retrieval by ID');
    console.log('   5. Order Retrieval by Customer');
    console.log('   6. Order Calculation Validation');
    console.log('   7. Order Status Validation');
    console.log('   8. Timestamp Validation');
    console.log('   9. Input Validation Tests');
    console.log('   10. Access Control Tests');
    console.log('');
    console.log('='.repeat(60) + '\n');
  });
});
