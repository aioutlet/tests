# E2E Tests (Browser-Based UI Tests)

This folder contains TRUE end-to-end tests that use Playwright for browser automation.

## Overview

E2E tests simulate real user interactions with the web-UI to validate complete user workflows from UI to backend.

### What E2E Tests Do:

- Test the web-UI (React components) in a real browser
- Simulate real user interactions (clicking, typing, navigating)
- Test complete user workflows from UI through all backend services
- Validate the entire application stack working together

Example: User clicks 'Add to Cart' button → Cart sidebar appears → User clicks 'Checkout' → Fills form → Submits order → Sees success page

## Prerequisites

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Install Playwright Browsers**

   ```bash
   npx playwright install
   ```

3. **Start the Web UI**

   ```bash
   cd ../ui/web-ui
   npm start
   ```

   The web-ui should be running on `http://localhost:3000`

4. **Start Required Services**
   Ensure all backend services are running that the web-ui depends on.

## Running Tests

### Run all E2E tests (headless)

```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)

```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
npm run test:e2e:headed
```

### Run tests in debug mode

```bash
npm run test:e2e:debug
```

### Run tests in specific browser

```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### View test report

```bash
npm run test:e2e:report
```

## Test Structure

```
e2e/
├── landing-page.spec.js     # Tests for homepage/landing page
├── auth.spec.js              # Tests for login/register flows
├── product.spec.js           # Tests for product browsing/details
├── cart.spec.js              # Tests for cart operations
├── checkout.spec.js          # Tests for checkout flow
└── README.md                 # This file
```

## Writing Tests

Example test structure:

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/some-page');

    // Act
    await page.click('button');
    await page.fill('input[name="email"]', 'test@example.com');

    // Assert
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

## Configuration

Configuration is in `../playwright.config.js`.

Key settings:

- **baseURL**: `http://localhost:3000` (web-ui)
- **timeout**: 30 seconds per test
- **retries**: 2 on CI, 0 locally
- **browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **screenshots**: Captured on failure
- **videos**: Recorded on failure

## Environment Variables

Copy `.env.e2e.example` to `.env.e2e` and adjust:

```bash
WEB_UI_URL=http://localhost:3000
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=TestPassword123!
```

## Best Practices

1. **Keep tests isolated** - Each test should be independent
2. **Use data-testid attributes** - Add `data-testid` to components for stable selectors
3. **Wait for network idle** - Use `page.waitForLoadState('networkidle')` after navigation
4. **Test user flows, not implementation** - Focus on what users see and do
5. **Avoid hardcoded waits** - Use Playwright's auto-waiting features
6. **Clean up test data** - Reset state between tests

## Debugging

### Debug a specific test

```bash
npx playwright test landing-page.spec.js --debug
```

### Generate test code

Use Playwright's code generator:

```bash
npx playwright codegen http://localhost:3000
```

### View trace files

```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

Tests run automatically in CI with:

- Headless mode
- Multiple browsers
- Retry on failure
- HTML report generation

## Current Tests

### Landing Page Tests (`landing-page.spec.js`)

- ✅ Homepage loads successfully
- ✅ Hero section displays
- ✅ Trending products section displays
- ✅ Shop by category section displays
- ✅ Why choose us section displays
- ✅ Navigation header is functional
- ✅ Footer with links displays
- ✅ Product navigation works
- ✅ Responsive on mobile
- ✅ Page scrolls correctly
- ✅ No console errors
- ✅ Loads within acceptable time

## Troubleshooting

**Tests timing out?**

- Ensure web-ui is running on port 3000
- Check that backend services are responding
- Increase timeout in playwright.config.js

**Selectors not found?**

- Add `data-testid` attributes to components
- Use more resilient selectors (role, text)
- Wait for elements to be visible

**Flaky tests?**

- Add proper waits (`waitForLoadState`)
- Ensure test isolation
- Check for race conditions
