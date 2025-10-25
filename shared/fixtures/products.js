/**
 * Product Test Fixtures
 * Provides reusable product test data matching product service schema
 */

/**
 * Generate test product
 */
export function generateTestProduct(overrides = {}) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  return {
    name: `Test Product ${timestamp}-${random}`,
    description: 'This is a test product for automated testing',
    price: 99.99,
    department: 'Electronics',
    category: 'Smartphones',
    subcategory: 'Android',
    brand: 'TestBrand',
    sku: `TEST-SKU-${timestamp}`,
    stock_quantity: 100,
    is_active: 'yes',
    tags: ['test', 'automated', 'electronics'],
    images: [
      {
        url: 'https://example.com/test-product-1.jpg',
        alt: 'Test Product Image 1',
        is_primary: true,
      },
    ],
    specifications: {
      weight: '200g',
      dimensions: '15cm x 8cm x 1cm',
      color: 'Black',
    },
    ...overrides,
  };
}

/**
 * Sample product for electronics category
 */
export const electronicsProduct = {
  name: 'Test Laptop',
  description: 'High-performance test laptop',
  price: 999.99,
  department: 'Electronics',
  category: 'Laptops',
  subcategory: 'Gaming',
  brand: 'TechBrand',
  sku: 'LAPTOP-001',
  stock_quantity: 50,
  is_active: 'yes',
  tags: ['laptop', 'gaming', 'electronics'],
};

/**
 * Sample product for clothing category
 */
export const clothingProduct = {
  name: 'Test T-Shirt',
  description: 'Comfortable test t-shirt',
  price: 19.99,
  department: 'Clothing',
  category: "Men's Clothing",
  subcategory: 'Shirts',
  brand: 'FashionBrand',
  sku: 'TSHIRT-001',
  stock_quantity: 200,
  is_active: 'yes',
  tags: ['clothing', 'shirt', 'casual'],
};

/**
 * Out of stock product
 */
export const outOfStockProduct = {
  name: 'Out of Stock Product',
  description: 'This product is out of stock',
  price: 49.99,
  department: 'Electronics',
  category: 'Tablets',
  sku: 'OOS-001',
  stock_quantity: 0,
  is_active: 'yes',
  tags: ['tablet', 'electronics'],
};

/**
 * Expensive product for testing
 */
export const expensiveProduct = {
  name: 'Expensive Test Product',
  description: 'Very expensive test product',
  price: 9999.99,
  department: 'Electronics',
  category: 'Laptops',
  subcategory: 'Premium',
  brand: 'LuxuryBrand',
  sku: 'LUXURY-001',
  stock_quantity: 5,
  is_active: 'yes',
  tags: ['luxury', 'premium', 'high-end'],
};

/**
 * Inactive product
 */
export const inactiveProduct = {
  name: 'Inactive Product',
  description: 'This product is inactive',
  price: 79.99,
  department: 'Electronics',
  category: 'Accessories',
  sku: 'INACTIVE-001',
  stock_quantity: 100,
  is_active: 'no',
  tags: ['accessories'],
};

/**
 * Low stock product
 */
export const lowStockProduct = {
  name: 'Low Stock Product',
  description: 'This product has low stock',
  price: 129.99,
  department: 'Electronics',
  category: 'Smartphones',
  brand: 'BrandX',
  sku: 'LOW-STOCK-001',
  stock_quantity: 5,
  is_active: 'yes',
  tags: ['smartphone', 'android'],
};

/**
 * Generate batch of test products
 */
export function generateTestProducts(count = 5, departmentOverride = null) {
  const departments = departmentOverride
    ? [departmentOverride]
    : ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];

  return Array.from({ length: count }, (_, i) => {
    const dept = departments[i % departments.length];
    return generateTestProduct({
      name: `Batch Test Product ${i}`,
      department: dept,
      price: 50 + i * 10,
      stock_quantity: 10 + i * 5,
    });
  });
}

/**
 * Generate products with different price ranges
 */
export function generateProductsByPriceRange() {
  return [
    generateTestProduct({ name: 'Budget Product', price: 9.99, tags: ['budget', 'affordable'] }),
    generateTestProduct({ name: 'Mid-Range Product', price: 99.99, tags: ['mid-range', 'value'] }),
    generateTestProduct({ name: 'Premium Product', price: 999.99, tags: ['premium', 'high-end'] }),
    generateTestProduct({ name: 'Luxury Product', price: 4999.99, tags: ['luxury', 'exclusive'] }),
  ];
}

export default {
  generateTestProduct,
  electronicsProduct,
  clothingProduct,
  outOfStockProduct,
  expensiveProduct,
  inactiveProduct,
  lowStockProduct,
  generateTestProducts,
  generateProductsByPriceRange,
};
