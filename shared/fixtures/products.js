/**
 * Product Test Fixtures
 * Provides reusable product test data
 */

/**
 * Generate test product
 */
export function generateTestProduct(overrides = {}) {
  const id = Math.random().toString(36).substring(7);
  return {
    productId: `test-product-${id}`,
    name: `Test Product ${id}`,
    description: 'A test product for automated testing',
    price: 29.99,
    category: 'test-category',
    stock: 100,
    sku: `SKU-${id.toUpperCase()}`,
    ...overrides,
  };
}

/**
 * Sample product for electronics category
 */
export const electronicsProduct = {
  productId: 'test-electronics-001',
  name: 'Test Laptop',
  description: 'High-performance test laptop',
  price: 999.99,
  category: 'electronics',
  stock: 50,
  sku: 'LAPTOP-001',
};

/**
 * Sample product for clothing category
 */
export const clothingProduct = {
  productId: 'test-clothing-001',
  name: 'Test T-Shirt',
  description: 'Comfortable test t-shirt',
  price: 19.99,
  category: 'clothing',
  stock: 200,
  sku: 'TSHIRT-001',
};

/**
 * Out of stock product
 */
export const outOfStockProduct = {
  productId: 'test-out-of-stock',
  name: 'Out of Stock Product',
  description: 'This product is out of stock',
  price: 49.99,
  category: 'test',
  stock: 0,
  sku: 'OOS-001',
};

/**
 * Expensive product for testing
 */
export const expensiveProduct = {
  productId: 'test-expensive-001',
  name: 'Expensive Test Product',
  description: 'Very expensive test product',
  price: 9999.99,
  category: 'luxury',
  stock: 5,
  sku: 'LUXURY-001',
};

/**
 * Generate batch of test products
 */
export function generateTestProducts(count = 5) {
  return Array.from({ length: count }, (_, i) =>
    generateTestProduct({
      productId: `batch-product-${i}`,
      name: `Batch Product ${i}`,
      price: 10 + i * 10,
    })
  );
}

export default {
  generateTestProduct,
  electronicsProduct,
  clothingProduct,
  outOfStockProduct,
  expensiveProduct,
  generateTestProducts,
};
