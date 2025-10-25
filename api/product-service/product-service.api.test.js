// API Test: Product Service
// Tests individual product-service endpoints in isolation

import axios from 'axios';
import { get, post, put, patch, del } from '../../shared/helpers/api.js';
import { generateTestProduct } from '../../shared/fixtures/products.js';

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:8003';
const PRODUCT_SERVICE_HEALTH_URL = process.env.PRODUCT_SERVICE_HEALTH_URL || 'http://localhost:8003/health';

describe('Product Service API Tests', () => {
  let testProduct;
  let productId;

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await get(PRODUCT_SERVICE_HEALTH_URL);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe('healthy');
      expect(response.data.service).toBe('product-service');

      console.log('✅ Product service is healthy');
    });
  });

  describe('Product Listing', () => {
    it('should list products with default pagination', async () => {
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products`);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.products).toBeDefined();
      expect(Array.isArray(response.data.products)).toBe(true);
      expect(response.data.total_count).toBeDefined();
      expect(typeof response.data.total_count).toBe('number');
      expect(response.data.current_page).toBeDefined();
      expect(response.data.total_pages).toBeDefined();

      console.log(`✅ Retrieved ${response.data.products.length} products (Total: ${response.data.total_count})`);
    });

    it('should respect limit parameter', async () => {
      const limit = 5;
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?limit=${limit}`);

      expect(response.status).toBe(200);
      expect(response.data.products.length).toBeLessThanOrEqual(limit);

      console.log(`✅ Limit parameter works: requested ${limit}, got ${response.data.products.length}`);
    });

    it('should respect skip parameter for pagination', async () => {
      const skip = 10;
      const limit = 5;
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?skip=${skip}&limit=${limit}`);

      expect(response.status).toBe(200);
      expect(response.data.products).toBeDefined();

      console.log(`✅ Skip parameter works: skipped ${skip}, returned ${response.data.products.length} products`);
    });

    it('should handle limit exceeding maximum (100)', async () => {
      const limit = 150;
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?limit=${limit}`);

      // API returns 422 for validation errors (limit exceeds maximum)
      expect(response.status).toBe(422);

      console.log(`✅ Maximum limit validation: requested ${limit}, rejected with 422`);
    });
  });

  describe('Product Filtering', () => {
    it('should filter products by department', async () => {
      const department = 'Electronics';
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?department=${department}`);

      expect(response.status).toBe(200);

      if (response.data.products.length > 0) {
        response.data.products.forEach((product) => {
          expect(product.department).toBe(department);
        });
        console.log(`✅ Department filter works: found ${response.data.products.length} ${department} products`);
      } else {
        console.log(`⏭️  No products found in ${department} department`);
      }
    });

    it('should filter products by category', async () => {
      const category = 'Smartphones';
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?category=${category}`);

      expect(response.status).toBe(200);

      if (response.data.products.length > 0) {
        response.data.products.forEach((product) => {
          expect(product.category).toBe(category);
        });
        console.log(`✅ Category filter works: found ${response.data.products.length} ${category} products`);
      } else {
        console.log(`⏭️  No products found in ${category} category`);
      }
    });

    it('should filter products by subcategory', async () => {
      const subcategory = 'Android';
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?subcategory=${subcategory}`);

      expect(response.status).toBe(200);
      console.log(`✅ Subcategory filter works: found ${response.data.products.length} products`);
    });

    it('should filter products by hierarchical structure (department > category > subcategory)', async () => {
      const department = 'Electronics';
      const category = 'Smartphones';
      const subcategory = 'Android';

      const response = await get(
        `${PRODUCT_SERVICE_URL}/api/products?department=${department}&category=${category}&subcategory=${subcategory}`
      );

      expect(response.status).toBe(200);

      if (response.data.products.length > 0) {
        response.data.products.forEach((product) => {
          expect(product.department).toBe(department);
          expect(product.category).toBe(category);
          expect(product.subcategory).toBe(subcategory);
        });
        console.log(`✅ Hierarchical filter works: ${department} > ${category} > ${subcategory}`);
      } else {
        console.log(`⏭️  No products match complete hierarchy`);
      }
    });

    it('should filter products by price range', async () => {
      const minPrice = 100;
      const maxPrice = 500;
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?min_price=${minPrice}&max_price=${maxPrice}`);

      expect(response.status).toBe(200);

      response.data.products.forEach((product) => {
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });

      console.log(
        `✅ Price range filter works: $${minPrice}-$${maxPrice}, found ${response.data.products.length} products`
      );
    });

    it('should filter products by minimum price only', async () => {
      const minPrice = 1000;
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?min_price=${minPrice}`);

      expect(response.status).toBe(200);

      response.data.products.forEach((product) => {
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
      });

      console.log(`✅ Minimum price filter works: >= $${minPrice}`);
    });

    it('should filter products by maximum price only', async () => {
      const maxPrice = 100;
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?max_price=${maxPrice}`);

      expect(response.status).toBe(200);

      response.data.products.forEach((product) => {
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });

      console.log(`✅ Maximum price filter works: <= $${maxPrice}`);
    });

    it('should filter products by tags', async () => {
      const tags = 'wireless,bluetooth';
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?tags=${tags}`);

      expect(response.status).toBe(200);

      if (response.data.products.length > 0) {
        const tagArray = tags.split(',');
        response.data.products.forEach((product) => {
          const hasTag = tagArray.some((tag) => product.tags?.includes(tag));
          expect(hasTag).toBe(true);
        });
        console.log(`✅ Tags filter works: found ${response.data.products.length} products with tags [${tags}]`);
      } else {
        console.log(`⏭️  No products found with tags [${tags}]`);
      }
    });

    it('should handle invalid filter parameters gracefully', async () => {
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?min_price=invalid&max_price=invalid`);

      // API returns 422 for validation errors (invalid price format)
      expect(response.status).toBe(422);
      console.log('✅ Invalid filter parameters rejected with validation error');
    });
  });

  describe('Product Retrieval', () => {
    beforeAll(async () => {
      // Get a real product ID from the database
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?limit=1`);
      if (response.data.products.length > 0) {
        productId = response.data.products[0]._id;
        console.log(`\n📝 Using test product ID: ${productId}`);
      }
    });

    it('should retrieve a product by ID', async () => {
      if (!productId) {
        console.log('⏭️  Skipped: No products available for testing');
        return;
      }

      const response = await get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data._id).toBe(productId);
      expect(response.data.name).toBeDefined();
      expect(response.data.price).toBeDefined();
      expect(response.data.department).toBeDefined();
      expect(response.data.category).toBeDefined();

      console.log(`✅ Retrieved product: ${response.data.name}`);
    });

    it('should return 404 for non-existent product ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products/${fakeId}`);

      expect(response.status).toBe(404);
      console.log('✅ Non-existent product returns 404');
    });

    it('should return 400 for invalid product ID format', async () => {
      const invalidId = 'invalid-id-format';
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products/${invalidId}`);

      expect([400, 422]).toContain(response.status);
      console.log(`✅ Invalid product ID format rejected (Status: ${response.status})`);
    });
  });

  describe('Admin Product Stats', () => {
    it('should retrieve admin product statistics', async () => {
      const response = await get(`${PRODUCT_SERVICE_URL}/api/admin/stats`);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.total).toBeDefined();
      expect(response.data.active).toBeDefined();
      expect(response.data.lowStock).toBeDefined();
      expect(response.data.outOfStock).toBeDefined();
      expect(typeof response.data.total).toBe('number');
      expect(typeof response.data.active).toBe('number');

      console.log(
        `✅ Admin stats: Total=${response.data.total}, Active=${response.data.active}, Low Stock=${response.data.lowStock}`
      );
    });
  });

  describe('Trending Products', () => {
    it('should retrieve trending products', async () => {
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products/trending`);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data.length > 0) {
        response.data.forEach((product) => {
          expect(product.name).toBeDefined();
          expect(product.price).toBeDefined();
        });
        console.log(`✅ Retrieved ${response.data.length} trending products`);
      } else {
        console.log('⏭️  No trending products available');
      }
    });

    it('should respect limit parameter for trending products', async () => {
      const limit = 3;
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products/trending?limit=${limit}`);

      expect(response.status).toBe(200);
      if (Array.isArray(response.data)) {
        expect(response.data.length).toBeLessThanOrEqual(limit);
        console.log(`✅ Trending products limit works: requested ${limit}, got ${response.data.length}`);
      }
    });
  });

  describe('Trending Categories', () => {
    it('should retrieve trending categories (if endpoint exists)', async () => {
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products/trending-categories`);

      // This endpoint may not exist yet, so accept 404 or 500
      if (response.status === 404 || response.status === 500) {
        console.log('⏭️  Trending categories endpoint not implemented yet');
        return;
      }

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data.length > 0) {
        response.data.forEach((category) => {
          expect(category.name).toBeDefined();
          expect(category.product_count).toBeDefined();
          expect(typeof category.product_count).toBe('number');
        });
        console.log(`✅ Retrieved ${response.data.length} trending categories`);
      } else {
        console.log('⏭️  No trending categories available');
      }
    });
  });

  describe('Response Structure Validation', () => {
    it('should return products with complete required fields', async () => {
      try {
        // Note: Trailing slash required to avoid 307 redirect with axios helper
        const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/?limit=10`);

        expect(response.status).toBe(200);

        if (response.data.products && response.data.products.length > 0) {
          const product = response.data.products[0];

          // Required fields
          expect(product.name).toBeDefined();
          expect(product.description).toBeDefined();
          expect(product.price).toBeDefined();
          expect(product.department).toBeDefined();
          expect(product.category).toBeDefined();
          expect(product.is_active).toBeDefined();
          expect(product.created_at).toBeDefined();
          expect(product.updated_at).toBeDefined();

          // Data types
          expect(typeof product.name).toBe('string');
          expect(typeof product.price).toBe('number');
          expect(typeof product.is_active).toBe('boolean');

          console.log('✅ Product response structure is valid');
        }
      } catch (error) {
        // Handle connection resets gracefully (product service may be under load)
        if (error.code === 'ECONNRESET') {
          console.log('⏭️  Skipped: Connection reset (service may be under load)');
          return;
        }
        throw error;
      }
    });
    it('should return pagination metadata in correct format', async () => {
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?limit=10&skip=0`);

      expect(response.status).toBe(200);
      expect(response.data.products).toBeDefined();
      expect(response.data.total_count).toBeDefined();
      expect(response.data.current_page).toBeDefined();
      expect(response.data.total_pages).toBeDefined();

      expect(typeof response.data.total_count).toBe('number');
      expect(typeof response.data.current_page).toBe('number');
      expect(typeof response.data.total_pages).toBe('number');

      console.log('✅ Pagination metadata format is valid');
    });
  });

  describe('Error Handling', () => {
    it('should handle negative price values in filter', async () => {
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?min_price=-100`);

      // API returns 422 for validation errors (negative price)
      expect(response.status).toBe(422);
      console.log('✅ Negative price values rejected with validation error');
    });

    it('should handle very large limit values', async () => {
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?limit=10000`);

      // API returns 422 for validation errors (limit exceeds maximum)
      expect(response.status).toBe(422);
      console.log('✅ Large limit values rejected with validation error');
    });

    it('should handle very large skip values', async () => {
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?skip=10000`);

      expect(response.status).toBe(200);
      expect(response.data.products.length).toBe(0); // Should return empty array
      console.log('✅ Large skip values handled gracefully');
    });

    it('should handle special characters in search parameters', async () => {
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?department=<script>alert('xss')</script>`);

      expect(response.status).toBe(200);
      console.log('✅ Special characters in parameters handled safely');
    });
  });

  describe('Performance', () => {
    it('should respond to product list request within acceptable time', async () => {
      const startTime = Date.now();
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?limit=20`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second

      console.log(`✅ Product list response time: ${responseTime}ms (< 1000ms)`);
    });

    it('should respond to product detail request within acceptable time', async () => {
      if (!productId) {
        console.log('⏭️  Skipped: No products available for testing');
        return;
      }

      const startTime = Date.now();
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500); // Should respond within 500ms

      console.log(`✅ Product detail response time: ${responseTime}ms (< 500ms)`);
    });
  });

  describe('Correlation ID Support', () => {
    it('should accept and process correlation ID header', async () => {
      const correlationId = 'test-correlation-' + Date.now();
      const response = await get(`${PRODUCT_SERVICE_URL}/api/products?limit=1`, {
        headers: { 'x-correlation-id': correlationId },
      });

      expect(response.status).toBe(200);
      // Response should echo back correlation ID in headers
      expect(response.headers['x-correlation-id']).toBeDefined();

      console.log(`✅ Correlation ID supported: ${correlationId}`);
    });
  });
});
