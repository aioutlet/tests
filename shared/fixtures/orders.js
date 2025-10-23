/**
 * Order Test Fixtures
 * Provides reusable order test data
 */

/**
 * Generate test order
 */
export function generateTestOrder(customerId, overrides = {}) {
  return {
    customerId,
    items: [
      {
        productId: 'test-product-001',
        productName: 'Test Product 1',
        quantity: 2,
        unitPrice: 29.99,
      },
      {
        productId: 'test-product-002',
        productName: 'Test Product 2',
        quantity: 1,
        unitPrice: 49.99,
      },
    ],
    shippingAddress: {
      addressLine1: '123 Test Street',
      addressLine2: 'Apt 4B',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345',
      country: 'USA',
    },
    billingAddress: {
      addressLine1: '123 Test Street',
      addressLine2: 'Apt 4B',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345',
      country: 'USA',
    },
    ...overrides,
  };
}

/**
 * Simple order with one item
 */
export function generateSimpleOrder(customerId) {
  return {
    customerId,
    items: [
      {
        productId: 'test-product-001',
        productName: 'Test Product',
        quantity: 1,
        unitPrice: 29.99,
      },
    ],
    shippingAddress: {
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345',
      country: 'USA',
    },
    billingAddress: {
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345',
      country: 'USA',
    },
  };
}

/**
 * Large order with many items
 */
export function generateLargeOrder(customerId) {
  return {
    customerId,
    items: Array.from({ length: 10 }, (_, i) => ({
      productId: `test-product-${i}`,
      productName: `Test Product ${i}`,
      quantity: Math.floor(Math.random() * 5) + 1,
      unitPrice: Math.floor(Math.random() * 100) + 10,
    })),
    shippingAddress: {
      addressLine1: '123 Test Street',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345',
      country: 'USA',
    },
    billingAddress: {
      addressLine1: '123 Test Street',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345',
      country: 'USA',
    },
  };
}

/**
 * Order with missing required fields
 */
export function generateInvalidOrder(customerId) {
  return {
    customerId,
    items: [], // Empty items - invalid
    // Missing addresses
  };
}

/**
 * Sample shipping address
 */
export const sampleShippingAddress = {
  addressLine1: '456 Main Street',
  addressLine2: 'Suite 100',
  city: 'Springfield',
  state: 'IL',
  zipCode: '62701',
  country: 'USA',
};

/**
 * Sample billing address
 */
export const sampleBillingAddress = {
  addressLine1: '456 Main Street',
  addressLine2: 'Suite 100',
  city: 'Springfield',
  state: 'IL',
  zipCode: '62701',
  country: 'USA',
};

/**
 * Calculate order total
 */
export function calculateOrderTotal(order) {
  return order.items.reduce((total, item) => {
    return total + item.quantity * item.unitPrice;
  }, 0);
}

export default {
  generateTestOrder,
  generateSimpleOrder,
  generateLargeOrder,
  generateInvalidOrder,
  sampleShippingAddress,
  sampleBillingAddress,
  calculateOrderTotal,
};
