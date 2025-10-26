// E2E Test: Cart Service Integration
// Tests the full cart workflow: Guest Cart → Add Items → Login → Transfer Cart → Sync Operations

import { generateTestUser, deleteUser } from '../../shared/helpers/user.js';
import { registerUser, login as loginUser } from '../../shared/helpers/auth.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const BFF_BASE_URL = process.env.BFF_URL || 'http://localhost:3100';

// Cart helper functions using BFF
const getCart = async (token) => {
  const response = await axios.get(`${BFF_BASE_URL}/api/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // BFF wraps cart service response, so we need response.data.data.data
  return response.data.data?.data || response.data.data || response.data;
};

const addItemToCart = async (itemData, token) => {
  const response = await axios.post(`${BFF_BASE_URL}/api/cart/items`, itemData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data.data?.data || response.data.data || response.data;
};

const updateCartItem = async (productId, quantity, token) => {
  const response = await axios.put(
    `${BFF_BASE_URL}/api/cart/items/${productId}`,
    { quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data?.data || response.data.data || response.data;
};

const removeCartItem = async (productId, token) => {
  const response = await axios.delete(`${BFF_BASE_URL}/api/cart/items/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data?.data || response.data.data || response.data;
};

const clearCart = async (token) => {
  const response = await axios.delete(`${BFF_BASE_URL}/api/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const transferCart = async (guestId, token) => {
  const response = await axios.post(
    `${BFF_BASE_URL}/api/cart/transfer`,
    { guestId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data?.data || response.data.data || response.data;
};

// Guest cart helper functions
const getGuestCart = async (guestId) => {
  const response = await axios.get(`${BFF_BASE_URL}/api/cart/guest/${guestId}`);
  return response.data.data?.data || response.data.data || response.data;
};

const addItemToGuestCart = async (guestId, itemData) => {
  const response = await axios.post(`${BFF_BASE_URL}/api/cart/guest/${guestId}/items`, itemData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data.data?.data || response.data.data || response.data;
};

const updateGuestCartItem = async (guestId, productId, quantity) => {
  const response = await axios.put(
    `${BFF_BASE_URL}/api/cart/guest/${guestId}/items/${productId}`,
    { quantity },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data?.data || response.data.data || response.data;
};

const removeGuestCartItem = async (guestId, productId) => {
  const response = await axios.delete(`${BFF_BASE_URL}/api/cart/guest/${guestId}/items/${productId}`);
  return response.data.data?.data || response.data.data || response.data;
};

const clearGuestCart = async (guestId) => {
  const response = await axios.delete(`${BFF_BASE_URL}/api/cart/guest/${guestId}`);
  return response.data;
};

// Test data
const testProducts = [
  {
    productId: '68fbd4809cf55b6662929beb',
    productName: 'Gold Layered Necklace',
    price: 45.99,
    quantity: 2,
  },
  {
    productId: '68fbd4809cf55b6662929bf5',
    productName: 'Samsung Galaxy S24',
    price: 1199.99,
    quantity: 1,
  },
  {
    productId: '68fbd4809cf55b6662929bf0',
    productName: 'Stainless Steel Watch',
    price: 199.99,
    quantity: 3,
  },
];

describe('Cart Service Integration E2E Tests', () => {
  let testUser;
  let userId;
  let accessToken;
  let guestId;

  beforeAll(async () => {
    console.log('\n✅ Cart Service Integration E2E tests - Testing full cart workflow\n');
  });

  afterAll(async () => {
    // Cleanup: Delete test user if created
    if (userId) {
      try {
        await deleteUser(userId);
        console.log('   ✅ Test user deleted successfully');
      } catch (error) {
        console.warn('   ⚠️  Could not delete test user:', error.message);
      }
    }
  });

  describe('Guest Cart Operations', () => {
    beforeAll(() => {
      guestId = uuidv4();
      console.log('📝 Guest Cart Tests - Using guest ID:', guestId);
    });

    afterAll(async () => {
      // Cleanup: Clear guest cart
      try {
        await clearGuestCart(guestId);
        console.log('   ✅ Guest cart cleaned up');
      } catch (error) {
        console.warn('   ⚠️  Could not clear guest cart:', error.message);
      }
    });

    test('should create empty guest cart on first access', async () => {
      console.log('\n📦 Test 1: Get empty guest cart');

      const cart = await getGuestCart(guestId);

      expect(cart).toBeDefined();
      expect(cart.userId || cart.guestId).toBe(guestId);
      expect(cart.items).toBeDefined();
      expect(Array.isArray(cart.items)).toBe(true);

      console.log('   ✅ Empty guest cart created successfully');
    });

    test('should add item to guest cart', async () => {
      console.log('\n📦 Test 2: Add item to guest cart');

      const item = testProducts[0];
      const cart = await addItemToGuestCart(guestId, item);

      expect(cart).toBeDefined();
      expect(cart.items).toBeDefined();
      expect(cart.items.length).toBeGreaterThan(0);

      const addedItem = cart.items.find((i) => i.productId === item.productId);
      expect(addedItem).toBeDefined();
      expect(addedItem.productName).toBe(item.productName);
      expect(addedItem.price).toBe(item.price);
      expect(addedItem.quantity).toBe(item.quantity);

      console.log(`   ✅ Item added: ${item.productName} (x${item.quantity})`);
    });

    test('should add multiple items to guest cart', async () => {
      console.log('\n📦 Test 3: Add multiple items to guest cart');

      // Add second item
      const item2 = testProducts[1];
      await addItemToGuestCart(guestId, item2);

      // Add third item
      const item3 = testProducts[2];
      const cart = await addItemToGuestCart(guestId, item3);

      expect(cart.items.length).toBe(3);

      const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const expectedTotal = testProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);

      expect(total).toBeCloseTo(expectedTotal, 2);

      console.log(`   ✅ ${cart.items.length} items in cart, total: $${total.toFixed(2)}`);
    });

    test('should update item quantity in guest cart', async () => {
      console.log('\n📦 Test 4: Update item quantity in guest cart');

      const productId = testProducts[0].productId;
      const newQuantity = 5;

      const cart = await updateGuestCartItem(guestId, productId, newQuantity);

      const updatedItem = cart.items.find((i) => i.productId === productId);
      expect(updatedItem).toBeDefined();
      expect(updatedItem.quantity).toBe(newQuantity);

      console.log(`   ✅ Item quantity updated to ${newQuantity}`);
    });

    test('should remove item from guest cart', async () => {
      console.log('\n📦 Test 5: Remove item from guest cart');

      const productId = testProducts[2].productId;
      const cartBefore = await getGuestCart(guestId);
      const itemCountBefore = cartBefore.items.length;

      const cart = await removeGuestCartItem(guestId, productId);

      expect(cart.items.length).toBe(itemCountBefore - 1);

      const removedItem = cart.items.find((i) => i.productId === productId);
      expect(removedItem).toBeUndefined();

      console.log(`   ✅ Item removed, ${cart.items.length} items remaining`);
    });

    test('should retrieve guest cart with items', async () => {
      console.log('\n📦 Test 6: Retrieve guest cart');

      const cart = await getGuestCart(guestId);

      expect(cart).toBeDefined();
      expect(cart.items).toBeDefined();
      expect(cart.items.length).toBe(2); // Should have 2 items left

      console.log(`   ✅ Guest cart retrieved with ${cart.items.length} items`);
    });
  });

  describe('Authenticated User Cart Operations', () => {
    beforeAll(async () => {
      console.log('\n📝 Setting up authenticated user...');

      // Register and login
      const timestamp = Date.now();
      testUser = {
        email: `carttest${timestamp}@example.com`,
        password: 'TestPass123!',
        firstName: 'Cart',
        lastName: 'Tester',
      };

      const registration = await registerUser(testUser);
      userId = registration.user._id || registration.user.id;

      await sleep(1000); // Wait for user to be ready

      const loginResponse = await loginUser(testUser.email, testUser.password);
      accessToken = loginResponse.data.jwt;

      console.log('   ✅ User registered and logged in');
      console.log(`   User ID: ${userId}`);
    });

    afterAll(async () => {
      // Cleanup: Clear authenticated cart
      try {
        await clearCart(accessToken);
        console.log('   ✅ Authenticated cart cleaned up');
      } catch (error) {
        console.warn('   ⚠️  Could not clear authenticated cart:', error.message);
      }
    });

    test('should get empty cart for new user', async () => {
      console.log('\n📦 Test 7: Get empty authenticated cart');

      const cart = await getCart(accessToken);

      expect(cart).toBeDefined();
      expect(cart.items).toBeDefined();
      expect(Array.isArray(cart.items)).toBe(true);

      console.log('   ✅ Empty authenticated cart retrieved');
    });

    test('should add item to authenticated cart', async () => {
      console.log('\n📦 Test 8: Add item to authenticated cart');

      const item = {
        productId: '68fbd4809cf55b6662929bf0',
        productName: 'Wireless Earbuds',
        price: 89.99,
        quantity: 1,
      };

      const cart = await addItemToCart(item, accessToken);

      expect(cart).toBeDefined();
      expect(cart.items.length).toBe(1);

      const addedItem = cart.items[0];
      expect(addedItem.productId).toBe(item.productId);
      expect(addedItem.quantity).toBe(item.quantity);

      console.log(`   ✅ Item added: ${item.productName}`);
    });

    test('should update item quantity in authenticated cart', async () => {
      console.log('\n📦 Test 9: Update item quantity in authenticated cart');

      const productId = '68fbd4809cf55b6662929bf0';
      const newQuantity = 3;

      const cart = await updateCartItem(productId, newQuantity, accessToken);

      const updatedItem = cart.items.find((i) => i.productId === productId);
      expect(updatedItem).toBeDefined();
      expect(updatedItem.quantity).toBe(newQuantity);

      console.log(`   ✅ Quantity updated to ${newQuantity}`);
    });

    test('should add multiple items to authenticated cart', async () => {
      console.log('\n📦 Test 10: Add multiple items to authenticated cart');

      const item2 = {
        productId: '68fbd4809cf55b6662929beb',
        productName: 'Gold Layered Necklace',
        price: 45.99,
        quantity: 2,
      };

      await addItemToCart(item2, accessToken);

      const cart = await getCart(accessToken);
      expect(cart.items.length).toBe(2);

      console.log(`   ✅ ${cart.items.length} items in authenticated cart`);
    });

    test('should remove item from authenticated cart', async () => {
      console.log('\n📦 Test 11: Remove item from authenticated cart');

      const productId = '68fbd4809cf55b6662929bf0';

      const cart = await removeCartItem(productId, accessToken);

      expect(cart.items.length).toBe(1);

      const removedItem = cart.items.find((i) => i.productId === productId);
      expect(removedItem).toBeUndefined();

      console.log(`   ✅ Item removed, ${cart.items.length} items remaining`);
    });

    test('should clear entire authenticated cart', async () => {
      console.log('\n📦 Test 12: Clear authenticated cart');

      await clearCart(accessToken);

      const cart = await getCart(accessToken);
      expect(cart.items.length).toBe(0);

      console.log('   ✅ Cart cleared successfully');
    });
  });

  describe('Cart Transfer Workflow', () => {
    let transferGuestId;
    let transferUserId;
    let transferToken;

    beforeAll(async () => {
      console.log('\n📝 Setting up cart transfer test...');

      // Create a new guest cart with items
      transferGuestId = uuidv4();

      // Add items to guest cart
      await addItemToGuestCart(transferGuestId, testProducts[0]);
      await addItemToGuestCart(transferGuestId, testProducts[1]);

      const guestCart = await getGuestCart(transferGuestId);
      console.log(`   ✅ Guest cart created with ${guestCart.items.length} items`);

      // Register a new user for transfer
      const timestamp = Date.now();
      const transferUser = {
        email: `transfer${timestamp}@example.com`,
        password: 'TestPass123!',
        firstName: 'Transfer',
        lastName: 'User',
      };

      const registration = await registerUser(transferUser);
      transferUserId = registration.user._id || registration.user.id;

      await sleep(1000);

      const loginResponse = await loginUser(transferUser.email, transferUser.password);
      transferToken = loginResponse.data.jwt;

      console.log('   ✅ Transfer user registered and logged in');
    });

    afterAll(async () => {
      // Cleanup
      try {
        await clearCart(transferToken);
        await deleteUser(transferUserId);
        console.log('   ✅ Transfer test cleanup completed');
      } catch (error) {
        console.warn('   ⚠️  Transfer test cleanup failed:', error.message);
      }
    });

    test('should transfer guest cart to authenticated user', async () => {
      console.log('\n📦 Test 13: Transfer guest cart to user account');

      // Transfer cart
      const mergedCart = await transferCart(transferGuestId, transferToken);

      expect(mergedCart).toBeDefined();
      expect(mergedCart.items).toBeDefined();
      expect(mergedCart.items.length).toBe(2);

      // Verify items transferred correctly
      const product1 = mergedCart.items.find((i) => i.productId === testProducts[0].productId);
      const product2 = mergedCart.items.find((i) => i.productId === testProducts[1].productId);

      expect(product1).toBeDefined();
      expect(product2).toBeDefined();

      console.log(`   ✅ Cart transferred successfully with ${mergedCart.items.length} items`);
    });

    test('should have transferred items in user cart', async () => {
      console.log('\n📦 Test 14: Verify transferred items persist');

      const cart = await getCart(transferToken);

      expect(cart.items.length).toBe(2);

      console.log('   ✅ Transferred items verified in user cart');
    });

    test('should merge guest cart with existing user cart', async () => {
      console.log('\n📦 Test 15: Test cart merging');

      // Add a new item to user cart first
      const userItem = {
        productId: '68fbd4809cf55b6662929bf0',
        productName: 'User Item',
        price: 99.99,
        quantity: 1,
      };
      await addItemToCart(userItem, transferToken);

      // Create new guest cart with different items
      const newGuestId = uuidv4();
      const guestItem = {
        productId: '68fbd4809cf55b6662929bf7',
        productName: 'Guest Item',
        price: 49.99,
        quantity: 2,
      };
      await addItemToGuestCart(newGuestId, guestItem);

      // Transfer and merge
      const mergedCart = await transferCart(newGuestId, transferToken);

      // Should have items from both carts
      expect(mergedCart.items.length).toBeGreaterThanOrEqual(3);

      console.log(`   ✅ Carts merged successfully: ${mergedCart.items.length} total items`);
    });
  });

  describe('Cart Persistence and Session Management', () => {
    test('should persist cart across sessions', async () => {
      console.log('\n📦 Test 16: Cart persistence across sessions');

      // Add item to cart
      const item = {
        productId: '68fbd4809cf55b6662929beb',
        productName: 'Persistent Item',
        price: 29.99,
        quantity: 1,
      };
      await addItemToCart(item, accessToken);

      // Simulate logout/login by fetching cart again
      await sleep(500);
      const cart = await getCart(accessToken);

      expect(cart.items.length).toBeGreaterThan(0);

      const persistedItem = cart.items.find((i) => i.productId === item.productId);
      expect(persistedItem).toBeDefined();

      console.log('   ✅ Cart persisted across session');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid guest ID gracefully', async () => {
      console.log('\n📦 Test 17: Invalid guest ID handling');

      const invalidGuestId = 'invalid-guest-id';

      try {
        // Guest cart endpoints typically create cart if not exists
        const cart = await getGuestCart(invalidGuestId);
        expect(cart).toBeDefined();
        console.log('   ✅ Invalid guest ID handled gracefully');
      } catch (error) {
        // If validation is strict, it should return 400
        expect(error.response?.status).toBe(400);
        console.log('   ✅ Invalid guest ID rejected as expected');
      }
    });

    test('should require authentication for user cart operations', async () => {
      console.log('\n📦 Test 18: Authentication required for user cart');

      try {
        await getCart('invalid-token');
        fail('Should have thrown authentication error');
      } catch (error) {
        expect(error.response?.status).toBe(401);
        console.log('   ✅ Authentication enforced correctly');
      }
    });

    test('should validate item data when adding to cart', async () => {
      console.log('\n📦 Test 19: Item validation');

      const invalidItem = {
        // Missing required fields
        productId: '',
        quantity: -1,
      };

      try {
        await addItemToCart(invalidItem, accessToken);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
        expect(error.response?.status).toBeLessThan(500);
        console.log('   ✅ Invalid item data rejected');
      }
    });

    test('should handle updating non-existent item', async () => {
      console.log('\n📦 Test 20: Update non-existent item');

      const nonExistentProductId = '68fbd4809cf55b6662929999';

      try {
        await updateCartItem(nonExistentProductId, 5, accessToken);
        fail('Should have thrown not found error');
      } catch (error) {
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
        console.log('   ✅ Non-existent item update handled correctly');
      }
    });
  });
});
