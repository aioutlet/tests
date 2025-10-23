# AIOutlet Test Suite

Comprehensive test suite for the AIOutlet microservices platform following industry-standard test pyramid architecture.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Pyramid Architecture](#test-pyramid-architecture)
- [Directory Structure](#directory-structure)
- [Test Types](#test-types)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## 🎯 Overview

This repository contains all automated tests for the AIOutlet e-commerce platform, organized following the test pyramid principle:

- **70% API Tests** - Fast, focused unit/component-level API tests
- **20% Integration Tests** - Multi-service interaction tests
- **10% E2E Tests** - Complete user workflow tests
- **Smoke Tests** - Critical path validation (< 5 minutes)
- **Performance Tests** - Load and stress testing

## 🏗️ Test Pyramid Architecture

```
                   /\
                  /  \
                 / E2E \ (10%) - Complete workflows
                /______\
               /        \
              /Integration\ (20%) - Service interactions
             /____________\
            /              \
           /   API Tests    \ (70%) - Individual endpoints
          /__________________\

         Smoke Tests (Always) - Critical paths
```

### When to Run Each Type

| Test Type   | When              | Duration | Failure Impact |
| ----------- | ----------------- | -------- | -------------- |
| Smoke       | Every commit      | < 5 min  | Block commit   |
| API         | Every commit/PR   | < 10 min | Block merge    |
| Integration | PR merge          | < 20 min | Block deploy   |
| E2E         | Nightly/Release   | < 60 min | Warning        |
| Performance | On-demand/Nightly | Variable | Alert          |

## 📁 Directory Structure

```
tests/
├── api/                          # API Tests (70%)
│   ├── auth-service/
│   │   ├── health.api.test.js
│   │   ├── registration.api.test.js
│   │   └── login.api.test.js
│   ├── user-service/
│   │   ├── health.api.test.js
│   │   ├── crud.api.test.js
│   │   └── profile.api.test.js
│   └── message-broker-service/
│       ├── health.api.test.js
│       ├── publish.api.test.js
│       └── auth.api.test.js
│
├── integration/                  # Integration Tests (20%)
│   ├── user-registration.integration.test.js
│   ├── user-login.integration.test.js
│   └── event-publishing.integration.test.js
│
├── e2e/                          # End-to-End Tests (10%)
│   ├── user-registration.e2e.test.js
│   ├── order-placement.e2e.test.js
│   └── checkout-flow.e2e.test.js
│
├── smoke/                        # Smoke Tests (Critical Path)
│   ├── health-checks.smoke.test.js
│   ├── auth-flow.smoke.test.js
│   └── critical-apis.smoke.test.js
│
├── performance/                  # Performance Tests
│   ├── auth-load.perf.test.js
│   ├── product-search.perf.test.js
│   └── checkout-stress.perf.test.js
│
├── shared/                       # Shared Utilities
│   ├── helpers/
│   │   ├── api.js              # API client helpers
│   │   ├── auth.js             # Authentication helpers
│   │   ├── database.js         # Database helpers
│   │   └── assertions.js       # Custom assertions
│   ├── fixtures/
│   │   ├── users.js            # User test data
│   │   ├── products.js         # Product test data
│   │   └── orders.js           # Order test data
│   └── config/
│       ├── setup.js            # Global test setup
│       ├── teardown.js         # Global test teardown
│       └── testSequencer.js    # Custom test sequencer
│
├── scripts/
│   └── wait-for-services.js    # Service startup waiter
│
├── package.json
├── jest.config.js               # Base Jest config
├── jest.config.api.js           # API test config
├── jest.config.integration.js   # Integration test config
├── jest.config.e2e.js           # E2E test config
├── jest.config.smoke.js         # Smoke test config
├── jest.config.performance.js   # Performance test config
├── babel.config.json
├── .env.example
└── README.md
```

## 🧪 Test Types

### API Tests (70%)

**Purpose**: Test individual service endpoints in isolation

- Fast execution (< 10 seconds per test)
- Focus on single API behavior
- Mock external dependencies
- Run on every commit

**Example**: `api/auth-service/registration.api.test.js`

```javascript
describe('Auth Service - Registration API', () => {
  it('should register user with valid data', async () => {
    const response = await api.post('/auth/register', validUserData);
    expect(response.status).toBe(201);
  });
});
```

### Integration Tests (20%)

**Purpose**: Test interactions between multiple services

- Moderate execution time (< 20 seconds per test)
- Test data flow across services
- Verify event publishing/consumption
- Run on PR merge

**Example**: `integration/user-registration.integration.test.js`

```javascript
describe('User Registration Integration', () => {
  it('should create user and publish event', async () => {
    // Register via auth service
    // Verify user in user service
    // Verify event in message broker
  });
});
```

### E2E Tests (10%)

**Purpose**: Test complete user workflows end-to-end

- Slower execution (< 60 seconds per test)
- Simulate real user behavior
- Test across entire system
- Run nightly or on release

**Example**: `e2e/order-placement.e2e.test.js`

```javascript
describe('Order Placement E2E', () => {
  it('should complete order from cart to payment', async () => {
    // Login
    // Add items to cart
    // Checkout
    // Process payment
    // Verify order created
  });
});
```

### Smoke Tests (Critical Path)

**Purpose**: Validate critical functionality before deployment

- Very fast (< 5 seconds per test)
- Only test must-work features
- Run on every commit
- Block deployment if failing

**Example**: `smoke/health-checks.smoke.test.js`

```javascript
describe('Critical Service Health', () => {
  it('should have all critical services running', async () => {
    await expect(authService.health()).resolves.toBeTruthy();
    await expect(userService.health()).resolves.toBeTruthy();
  });
});
```

### Performance Tests

**Purpose**: Validate system performance under load

- Long execution (minutes to hours)
- Test concurrent users, throughput, latency
- Run on-demand or nightly
- Generate performance reports

**Example**: `performance/auth-load.perf.test.js`

```javascript
describe('Auth Service Load Test', () => {
  it('should handle 100 concurrent logins', async () => {
    const results = await loadTest({
      endpoint: '/auth/login',
      concurrentUsers: 100,
      duration: 60,
    });
    expect(results.p95Latency).toBeLessThan(500);
  });
});
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (for services)
- All AIOutlet microservices running locally

### Installation

```bash
# Clone the repository
git clone https://github.com/aioutlet/tests.git
cd tests

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start required services
npm run services:up

# Wait for services to be ready
npm run wait-for-services
```

## 🏃 Running Tests

### All Tests

```bash
npm test                    # Run all tests (not recommended)
```

### By Test Type

```bash
npm run test:smoke          # Smoke tests (< 5 min)
npm run test:api            # API tests (< 10 min)
npm run test:integration    # Integration tests (< 20 min)
npm run test:e2e            # E2E tests (< 60 min)
npm run test:performance    # Performance tests (variable)
```

### By Service

```bash
npm run test:api:auth       # Auth service API tests
npm run test:api:user       # User service API tests
npm run test:api:message-broker  # Message broker API tests
```

### Watch Mode

```bash
npm run test:api:watch      # Watch mode for API tests
npm run test:integration:watch
npm run test:e2e:watch
```

### Coverage

```bash
npm run test:coverage       # Generate coverage report
```

### CI/CD Workflows

```bash
npm run test:ci             # Run smoke + API + integration (for CI)
npm run test:all            # Run API + integration + E2E
npm run test:nightly        # Run all tests including performance
```

## ✍️ Writing Tests

### Test Naming Conventions

- **API Tests**: `<feature>.api.test.js`
- **Integration Tests**: `<workflow>.integration.test.js`
- **E2E Tests**: `<scenario>.e2e.test.js`
- **Smoke Tests**: `<critical-path>.smoke.test.js`
- **Performance Tests**: `<scenario>.perf.test.js`

### Test Structure

```javascript
import { apiClient } from '../shared/helpers/api.js';
import { createTestUser } from '../shared/fixtures/users.js';

describe('Service Name - Feature', () => {
  let testUser;

  beforeAll(async () => {
    // Setup once for all tests
  });

  beforeEach(async () => {
    // Setup before each test
    testUser = await createTestUser();
  });

  afterEach(async () => {
    // Cleanup after each test
    await deleteTestUser(testUser.id);
  });

  afterAll(async () => {
    // Cleanup once after all tests
  });

  describe('Happy Path', () => {
    it('should perform expected behavior', async () => {
      // Arrange
      const input = {
        /* test data */
      };

      // Act
      const response = await apiClient.post('/endpoint', input);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        /* expected */
      });
    });
  });

  describe('Error Cases', () => {
    it('should handle invalid input', async () => {
      const response = await apiClient.post('/endpoint', {});
      expect(response.status).toBe(400);
    });
  });
});
```

### Using Shared Helpers

```javascript
// Import API client
import { apiClient } from '../shared/helpers/api.js';

// Import authentication helpers
import { login, getAuthToken } from '../shared/helpers/auth.js';

// Import test data
import { validUser, invalidUser } from '../shared/fixtures/users.js';

// Use in tests
const token = await getAuthToken(validUser);
const response = await apiClient.get('/profile', { token });
```

## 🔄 CI/CD Integration

### Recommended Pipeline

```yaml
# On every commit
- run: npm run test:smoke # Must pass (< 5 min)
- run: npm run test:api # Must pass (< 10 min)

# On PR
- run: npm run test:ci # Smoke + API + Integration (< 30 min)

# On merge to main
- run: npm run test:all # API + Integration + E2E (< 90 min)

# Nightly
- run: npm run test:nightly # All tests + performance
```

### Test Timing Guidelines

| Environment | Tests                     | Max Duration |
| ----------- | ------------------------- | ------------ |
| Dev Machine | Smoke                     | 5 min        |
| Commit Hook | Smoke                     | 5 min        |
| CI - Commit | Smoke + API               | 15 min       |
| CI - PR     | Smoke + API + Integration | 30 min       |
| CI - Merge  | All                       | 90 min       |
| Nightly     | All + Performance         | Unlimited    |

## 📚 Best Practices

### General

- Follow AAA pattern (Arrange, Act, Assert)
- One assertion per test when possible
- Use descriptive test names
- Clean up test data after tests
- Use shared helpers and fixtures
- Mock external dependencies in API tests

### API Tests

- Test one endpoint at a time
- Focus on request/response contract
- Mock database and external services
- Use in-memory test databases when possible

### Integration Tests

- Test service-to-service communication
- Verify event publishing/consumption
- Test data consistency across services
- Use test containers for dependencies

### E2E Tests

- Test critical user journeys
- Minimize number of E2E tests
- Make them resilient to UI changes
- Use page object pattern
- Run against staging environment

### Smoke Tests

- Only test absolute must-work features
- Keep them extremely fast
- Run before any deployment
- Should complete in < 5 minutes total

## 🛠️ Troubleshooting

### Services Not Starting

```bash
# Check service status
npm run services:status

# View service logs
npm run services:logs

# Restart services
npm run services:down
npm run services:up
```

### Tests Failing Intermittently

- Increase timeout in specific test config
- Check for race conditions
- Ensure proper cleanup between tests
- Run tests sequentially (maxWorkers: 1)

### Test Data Conflicts

- Use unique identifiers for test data
- Clean up data in afterEach/afterAll
- Enable CLEANUP_AFTER_TESTS in .env
- Use database transactions when possible

## 📊 Test Metrics

Track these metrics to maintain quality:

- **Test Coverage**: Aim for 80%+ API coverage
- **Test Speed**: API < 10s, Integration < 20s, E2E < 60s
- **Flakiness Rate**: < 1% failure rate
- **Test Count**: Maintain 70/20/10 pyramid ratio

## 🤝 Contributing

When adding new tests:

1. Follow the test pyramid (70/20/10)
2. Use appropriate test type for your scenario
3. Follow naming conventions
4. Add to relevant test suite
5. Update this README if needed

## 📄 License

MIT License - see LICENSE file for details

---

**Maintained by**: AIOutlet Team
**Last Updated**: 2025
