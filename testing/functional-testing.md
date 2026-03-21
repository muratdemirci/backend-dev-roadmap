# Functional / End-to-End Testing

Functional testing (also called end-to-end or E2E testing) verifies that complete user workflows operate correctly through the entire application stack -- from the user interface through the backend to the database and back. These tests simulate real user behavior and validate that all layers of the system work together to deliver the expected experience.

---

## Why Functional Testing Matters

Unit and integration tests verify individual pieces and connections, but they cannot confirm that the full user journey works as intended. Functional tests answer questions like:

- Can a user register, log in, and access their dashboard?
- Does the checkout process complete a purchase and send a confirmation?
- Does the search feature return correct results and paginate properly?

## Where E2E Fits in the Testing Pyramid

```
        /   E2E   \          5-10% of tests | Slowest | Most expensive
       /------------\
      / Integration   \      15-20% of tests
     /------------------\
    /    Unit Tests       \  70-80% of tests | Fastest | Cheapest
   /________________________\
```

E2E tests are at the top of the pyramid. You should have few of them, focused on the most critical user journeys. They are slow, brittle, and expensive to maintain compared to unit and integration tests.

## Popular E2E Testing Tools

| Tool | Languages | Key Features |
|------|-----------|-------------|
| **Playwright** | JS, Python, Java, .NET | Multi-browser, auto-wait, codegen, trace viewer |
| **Cypress** | JavaScript | Developer-friendly, time-travel debugging, real-time reloads |
| **Selenium** | Java, Python, JS, C#, Ruby | Oldest, widest browser support, WebDriver standard |
| **Puppeteer** | JavaScript | Chrome/Chromium focused, Google-maintained |

## Playwright

Playwright is a modern E2E testing framework created by Microsoft. It supports Chromium, Firefox, and WebKit with a single API.

```javascript
// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

```javascript
// tests/e2e/login.spec.js
const { test, expect } = require('@playwright/test');

test('user can log in and view dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="email"]', 'alice@example.com');
  await page.fill('[data-testid="password"]', 'secure-password');
  await page.click('[data-testid="login-button"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toHaveText('Welcome, Alice');
  await expect(page.locator('[data-testid="user-stats"]')).toBeVisible();
});

test('shows error for invalid credentials', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="email"]', 'alice@example.com');
  await page.fill('[data-testid="password"]', 'wrong-password');
  await page.click('[data-testid="login-button"]');

  await expect(page.locator('[data-testid="error-message"]'))
    .toHaveText('Invalid email or password');
  await expect(page).toHaveURL('/login');
});
```

## Cypress

Cypress runs directly in the browser alongside your application, providing real-time feedback and powerful debugging.

```javascript
// cypress/e2e/checkout.cy.js
describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.login('alice@example.com', 'secure-password');
  });

  it('completes a purchase successfully', () => {
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart"]').click();
    cy.get('[data-testid="cart-badge"]').should('contain', '1');

    cy.visit('/cart');
    cy.get('[data-testid="checkout-button"]').click();

    // Fill shipping details
    cy.get('#address').type('123 Main St');
    cy.get('#city').type('Springfield');
    cy.get('#zip').type('62701');
    cy.get('[data-testid="continue-button"]').click();

    // Confirm order
    cy.get('[data-testid="place-order"]').click();
    cy.url().should('include', '/order-confirmation');
    cy.get('[data-testid="order-number"]').should('exist');
  });
});
```

## Selenium

Selenium is the oldest and most widely adopted browser automation framework. It uses the WebDriver protocol and supports all major browsers.

```python
# Selenium with Python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_user_registration():
    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 10)

    try:
        driver.get("http://localhost:3000/register")

        driver.find_element(By.ID, "name").send_keys("Alice")
        driver.find_element(By.ID, "email").send_keys("alice@example.com")
        driver.find_element(By.ID, "password").send_keys("secure-password")
        driver.find_element(By.CSS_SELECTOR, "[data-testid='register-button']").click()

        # Wait for redirect to dashboard
        wait.until(EC.url_contains("/dashboard"))
        heading = driver.find_element(By.TAG_NAME, "h1")
        assert "Welcome" in heading.text
    finally:
        driver.quit()
```

## Writing Good User Flow Tests

Structure your E2E tests around real user scenarios, not technical implementation:

```
Scenario: New user signup and first purchase
  1. User visits the homepage
  2. User clicks "Sign Up"
  3. User fills in registration form
  4. User verifies email (or skips in test env)
  5. User browses products
  6. User adds item to cart
  7. User completes checkout
  8. User sees order confirmation
```

## Best Practices

1. **Test critical paths only** -- Focus on login, registration, checkout, and core workflows. Do not test every edge case at the E2E level.
2. **Use data-testid attributes** -- Decouple tests from CSS classes and DOM structure.
3. **Avoid brittle selectors** -- `[data-testid="submit"]` is more stable than `.btn-primary:nth-child(3)`.
4. **Set up test data through the API** -- Seed data via API calls or database fixtures, not through the UI.
5. **Keep tests independent** -- Each test should be able to run in isolation, without depending on other tests.
6. **Handle async operations** -- Use auto-wait features (Playwright) or explicit waits (Selenium) instead of `sleep()`.
7. **Run in CI with headless browsers** -- Playwright and Cypress both support headless mode for CI pipelines.
8. **Clean up after tests** -- Reset application state between tests to prevent interference.

## Running E2E Tests

```bash
# Playwright
npx playwright test
npx playwright test --headed     # Watch the browser
npx playwright show-report       # View HTML report

# Cypress
npx cypress run                  # Headless
npx cypress open                 # Interactive runner

# Selenium (pytest)
pytest tests/e2e/ -v
```

## CI Integration

```yaml
# GitHub Actions with Playwright
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run start &
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Martin Fowler - Broad Integration Test](https://martinfowler.com/bliki/BroadStackTest.html)
- [Testing Trophy (Kent C. Dodds)](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Google Testing Blog - Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
