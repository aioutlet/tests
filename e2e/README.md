# E2E Tests (Browser-Based UI Tests)

This folder is for TRUE end-to-end tests that use browser automation tools like Playwright, Cypress, or Selenium.

E2E tests should:
- Test the web-UI (React components)
- Simulate real user interactions (clicking, typing, navigating)
- Use a real browser
- Test complete user workflows from UI to backend

Example: User clicks 'Add to Cart' button → Cart sidebar appears → User clicks 'Checkout' → Fills form → Submits order → Sees success page

Currently: No E2E tests exist yet. All current tests are integration tests (in ../integration/).
