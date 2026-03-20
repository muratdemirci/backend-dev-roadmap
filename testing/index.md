# Testing

---

# Contents

1.  [Why Testing Matters](#why-testing-matters)
2.  [Testing Pyramid](#testing-pyramid)
3.  [Unit Testing](#unit-testing)
4.  [Integration Testing](#integration-testing)
5.  [End-to-End Testing](#end-to-end-testing)
6.  [Performance Testing](#performance-testing)
7.  [Security Testing](#security-testing)
8.  [Code Coverage](#code-coverage)
9.  [CI Integration for Tests](#ci-integration-for-tests)
10. [Testing Best Practices](#testing-best-practices)
11. [Resources](#resources)

# Why Testing Matters

Testing is the practice of verifying that your software works as expected. It is not an afterthought or a luxury -- it is a fundamental part of professional software development.

**Key benefits of testing:**

- **Confidence in Changes** -- Tests let you refactor, add features, and fix bugs without fear of breaking existing functionality.
- **Living Documentation** -- Well-written tests describe what the code does and serve as examples for other developers.
- **Faster Development** -- While writing tests takes time upfront, it saves far more time by catching bugs early rather than in production.
- **Better Design** -- Code that is easy to test tends to be well-structured, loosely coupled, and follows good design principles.
- **Reduced Cost** -- The cost of fixing a bug increases exponentially the later it is discovered. A bug caught in unit tests costs minutes; in production, it can cost hours, revenue, or reputation.

> **The Rule of Thumb:** If you are afraid to change your code because it might break something, you do not have enough tests.

# Testing Pyramid

The testing pyramid is a model that describes the ideal distribution of tests in a software project. It was popularized by Mike Cohn.

```
        /  E2E   \          Few, slow, expensive
       /----------\
      / Integration \       Moderate number and speed
     /----------------\
    /    Unit Tests     \   Many, fast, cheap
   /____________________\
```

```mermaid
graph TD
    subgraph Testing Pyramid
        E2E["E2E Tests<br/>5-10% | Slow | Expensive"]
        INT["Integration Tests<br/>15-20% | Medium Speed"]
        UNIT["Unit Tests<br/>70-80% | Fast | Cheap"]
    end

    E2E --- INT
    INT --- UNIT

    style E2E fill:#ff6666,stroke:#333,color:#000
    style INT fill:#ffcc66,stroke:#333,color:#000
    style UNIT fill:#66cc66,stroke:#333,color:#000
```

| Level | Quantity | Speed | Cost | Scope |
|-------|----------|-------|------|-------|
| **Unit** | Many (70-80%) | Milliseconds | Lowest | Single function or class |
| **Integration** | Some (15-20%) | Seconds | Medium | Multiple components together |
| **E2E** | Few (5-10%) | Minutes | Highest | Entire application flow |

The pyramid suggests that you should have many unit tests forming the base, a moderate number of integration tests in the middle, and a small number of end-to-end tests at the top. This distribution gives you the best balance of coverage, speed, and maintainability.

# Unit Testing

Unit testing verifies that individual units of code (functions, methods, classes) work correctly in isolation. Dependencies are replaced with mocks or stubs to ensure the test only exercises the unit under test.

## Frameworks by Language

| Language | Popular Frameworks |
|----------|--------------------|
| JavaScript/TypeScript | Jest, Vitest, Mocha, AVA |
| Python | pytest, unittest |
| Java | JUnit 5, TestNG |
| Go | Built-in `testing` package |
| C# | xUnit, NUnit, MSTest |
| Rust | Built-in `#[test]` |
| Ruby | RSpec, Minitest |

## Jest Example (JavaScript)

```javascript
// math.js
function add(a, b) {
  return a + b;
}

function divide(a, b) {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}

module.exports = { add, divide };
```

```javascript
// math.test.js
const { add, divide } = require('./math');

describe('add', () => {
  test('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('adds negative numbers', () => {
    expect(add(-1, -2)).toBe(-3);
  });

  test('adds zero', () => {
    expect(add(5, 0)).toBe(5);
  });
});

describe('divide', () => {
  test('divides two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  test('throws on division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });
});
```

## pytest Example (Python)

```python
# calculator.py
class Calculator:
    def add(self, a, b):
        return a + b

    def divide(self, a, b):
        if b == 0:
            raise ValueError("Division by zero")
        return a / b
```

```python
# test_calculator.py
import pytest
from calculator import Calculator

@pytest.fixture
def calc():
    return Calculator()

def test_add(calc):
    assert calc.add(2, 3) == 5

def test_add_negative(calc):
    assert calc.add(-1, -2) == -3

def test_divide(calc):
    assert calc.divide(10, 2) == 5.0

def test_divide_by_zero(calc):
    with pytest.raises(ValueError, match="Division by zero"):
        calc.divide(10, 0)
```

## Go Testing Example

```go
// calculator.go
package calculator

import "errors"

func Add(a, b int) int {
    return a + b
}

func Divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}
```

```go
// calculator_test.go
package calculator

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Add(2, 3) = %d; want 5", result)
    }
}

func TestDivide(t *testing.T) {
    result, err := Divide(10, 2)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if result != 5.0 {
        t.Errorf("Divide(10, 2) = %f; want 5.0", result)
    }
}

func TestDivideByZero(t *testing.T) {
    _, err := Divide(10, 0)
    if err == nil {
        t.Fatal("expected error for division by zero")
    }
}
```

## Mocking and Stubbing

Mocking replaces real dependencies with controlled substitutes so you can test a unit in isolation.

| Term | Description |
|------|-------------|
| **Mock** | An object that records calls and can verify interactions |
| **Stub** | An object that returns predetermined responses |
| **Spy** | Wraps a real object and records calls while preserving original behavior |
| **Fake** | A simplified but functional implementation (e.g., in-memory database) |

```javascript
// Mocking with Jest
const userService = require('./userService');
const db = require('./db');

jest.mock('./db');

test('getUser returns user from database', async () => {
  // Arrange - set up the mock
  db.query.mockResolvedValue({ id: 1, name: 'Alice' });

  // Act
  const user = await userService.getUser(1);

  // Assert
  expect(user.name).toBe('Alice');
  expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
});
```

```python
# Mocking with pytest and unittest.mock
from unittest.mock import MagicMock, patch
from user_service import UserService

def test_get_user():
    # Arrange
    mock_db = MagicMock()
    mock_db.query.return_value = {"id": 1, "name": "Alice"}
    service = UserService(db=mock_db)

    # Act
    user = service.get_user(1)

    # Assert
    assert user["name"] == "Alice"
    mock_db.query.assert_called_once_with("SELECT * FROM users WHERE id = %s", (1,))
```

## Test-Driven Development (TDD)

TDD is a development methodology where you write tests before writing the code. It follows a strict cycle known as Red-Green-Refactor:

```mermaid
graph LR
    RED["RED<br/>Write a<br/>Failing Test"] --> GREEN["GREEN<br/>Write Minimum Code<br/>to Pass"]
    GREEN --> REFACTOR["REFACTOR<br/>Improve Code<br/>Keep Tests Green"]
    REFACTOR --> RED

    style RED fill:#ff4444,stroke:#333,color:#fff
    style GREEN fill:#44aa44,stroke:#333,color:#fff
    style REFACTOR fill:#4488cc,stroke:#333,color:#fff
```

```
1. RED    --> Write a failing test for the desired behavior
2. GREEN  --> Write the minimum code to make the test pass
3. REFACTOR --> Improve the code while keeping tests green
4. REPEAT
```

**Benefits of TDD:**
- Forces you to think about requirements before implementation
- Results in high test coverage by design
- Produces cleaner, more modular code
- Provides immediate feedback during development

> **Tip:** TDD works best for well-defined behavior. For exploratory or prototyping work, it can be more practical to write tests after initial implementation.

# Integration Testing

Integration testing verifies that multiple components work correctly together. Unlike unit tests that isolate dependencies, integration tests use real databases, file systems, or external services.

**Common scenarios:**
- Testing API endpoints with a real database
- Testing that services communicate correctly
- Testing database migrations
- Testing message queue producers and consumers

```javascript
// Integration test with supertest (Node.js/Express)
const request = require('supertest');
const app = require('./app');
const db = require('./db');

beforeAll(async () => {
  await db.migrate();
  await db.seed();
});

afterAll(async () => {
  await db.close();
});

describe('GET /api/users', () => {
  test('returns list of users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer valid-token')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('email');
  });

  test('returns 401 without authentication', async () => {
    await request(app)
      .get('/api/users')
      .expect(401);
  });
});
```

```python
# Integration test with pytest and Flask
import pytest
from app import create_app, db

@pytest.fixture
def client():
    app = create_app(testing=True)
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_create_user(client):
    response = client.post('/api/users', json={
        'name': 'Alice',
        'email': 'alice@example.com'
    })
    assert response.status_code == 201
    assert response.json['name'] == 'Alice'

def test_get_users(client):
    # Create a user first
    client.post('/api/users', json={'name': 'Bob', 'email': 'bob@example.com'})

    response = client.get('/api/users')
    assert response.status_code == 200
    assert len(response.json) == 1
```

> **Tip:** Use Docker containers to spin up real databases for integration tests. Tools like Testcontainers make this straightforward.

# End-to-End Testing

End-to-End (E2E) testing verifies complete user workflows through the entire application stack, from the UI to the database and back.

**Popular E2E Testing Tools:**

| Tool | Language | Key Features |
|------|----------|-------------|
| **Playwright** | JS, Python, Java, .NET | Multi-browser, fast, auto-wait |
| **Cypress** | JavaScript | Developer-friendly, time-travel debugging |
| **Selenium** | Multi-language | Oldest, widest browser support |
| **Puppeteer** | JavaScript | Chrome/Chromium focused |

```javascript
// Playwright E2E test example
const { test, expect } = require('@playwright/test');

test('user can log in and view dashboard', async ({ page }) => {
  // Navigate to login page
  await page.goto('https://myapp.com/login');

  // Fill in credentials
  await page.fill('[data-testid="email"]', 'alice@example.com');
  await page.fill('[data-testid="password"]', 'secure-password');
  await page.click('[data-testid="login-button"]');

  // Verify redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toHaveText('Welcome, Alice');

  // Verify dashboard content
  await expect(page.locator('[data-testid="user-stats"]')).toBeVisible();
});
```

> **Tip:** Keep E2E tests focused on critical user journeys (login, checkout, registration). Do not try to test every edge case at the E2E level -- that is what unit and integration tests are for.

# Performance Testing

Performance testing ensures your application can handle expected (and unexpected) load levels.

| Type | Purpose | Example |
|------|---------|---------|
| **Load Testing** | Verify behavior under expected load | 1000 concurrent users for 10 minutes |
| **Stress Testing** | Find the breaking point | Increase load until the system fails |
| **Spike Testing** | Test sudden traffic surges | Jump from 100 to 10,000 users instantly |
| **Soak Testing** | Find memory leaks and degradation | Run at moderate load for 24 hours |

**Popular tools:**
- **k6** -- Modern, scriptable load testing tool (JavaScript-based)
- **Apache JMeter** -- Java-based, GUI and CLI, widely used
- **Locust** -- Python-based, distributed load testing
- **Artillery** -- Node.js-based, YAML configuration

```javascript
// k6 load test example
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '1m',  target: 50 },   // Stay at 50 users
    { duration: '30s', target: 200 },  // Ramp up to 200 users
    { duration: '1m',  target: 200 },  // Stay at 200 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
};

export default function () {
  const res = http.get('https://api.example.com/users');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

# Security Testing

Security testing identifies vulnerabilities in your application before attackers do.

**Types of security testing:**

- **Static Application Security Testing (SAST)** -- Analyzes source code for vulnerabilities without running the application. Tools: SonarQube, Semgrep, CodeQL.
- **Dynamic Application Security Testing (DAST)** -- Tests the running application by sending malicious requests. Tools: OWASP ZAP, Burp Suite.
- **Dependency Scanning** -- Checks third-party dependencies for known vulnerabilities. Tools: Snyk, npm audit, Dependabot.
- **Penetration Testing** -- Manual or automated testing that simulates real-world attacks.

```bash
# Check npm dependencies for known vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Python dependency scanning with safety
pip install safety
safety check
```

# Code Coverage

Code coverage measures the percentage of your code that is executed during testing. It is a useful metric but not a goal in itself.

**Types of coverage:**

| Type | Measures |
|------|----------|
| **Line Coverage** | Percentage of lines executed |
| **Branch Coverage** | Percentage of conditional branches (if/else) taken |
| **Function Coverage** | Percentage of functions called |
| **Statement Coverage** | Percentage of statements executed |

```bash
# Jest with coverage
npx jest --coverage

# pytest with coverage
pytest --cov=myapp --cov-report=html

# Go coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

**Example Jest coverage output:**

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   87.5  |    75    |   90    |   87.5  |
 math.js            |   100   |   100    |   100   |   100   |
 userService.js     |   80    |    60    |   85    |    80   |
--------------------|---------|----------|---------|---------|
```

> **Tip:** Aim for 80% coverage as a general guideline, but focus on covering critical paths and business logic. 100% coverage does not mean bug-free code -- you can have full coverage with poor assertions.

# CI Integration for Tests

Running tests automatically in a CI pipeline ensures that every code change is verified before it reaches production.

```yaml
# GitHub Actions example
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

```mermaid
flowchart LR
    Push["Git Push /<br/>Pull Request"] --> Lint["Lint &<br/>Format Check"]
    Lint --> Unit["Unit Tests"]
    Unit --> Integration["Integration<br/>Tests"]
    Integration --> E2E["E2E Tests"]
    E2E --> Coverage["Coverage<br/>Report"]
    Coverage --> Deploy{"All Passed?"}
    Deploy -- Yes --> Ship["Deploy /<br/>Merge"]
    Deploy -- No --> Fail["Block &<br/>Notify"]

    style Push fill:#4488cc,stroke:#333,color:#fff
    style Ship fill:#44aa44,stroke:#333,color:#fff
    style Fail fill:#ff4444,stroke:#333,color:#fff
```

**Key CI testing principles:**
- Run tests on every push and pull request
- Fail fast -- run unit tests first, then integration, then E2E
- Use parallel execution to speed up test suites
- Cache dependencies to reduce build times
- Report coverage and track trends over time

# Testing Best Practices

## The AAA Pattern

Structure every test with three distinct phases:

```
Arrange  --> Set up test data and dependencies
Act      --> Execute the code under test
Assert   --> Verify the result matches expectations
```

```javascript
test('calculates order total with tax', () => {
  // Arrange
  const order = new Order([
    { name: 'Widget', price: 10.00, quantity: 2 },
    { name: 'Gadget', price: 25.00, quantity: 1 }
  ]);
  const taxRate = 0.08;

  // Act
  const total = order.calculateTotal(taxRate);

  // Assert
  expect(total).toBe(48.60);
});
```

## FIRST Principles

| Principle | Description |
|-----------|-------------|
| **F** - Fast | Tests should run in milliseconds, not seconds |
| **I** - Independent | Tests should not depend on each other or run order |
| **R** - Repeatable | Tests should produce the same result every time |
| **S** - Self-validating | Tests should have a clear pass/fail result (no manual inspection) |
| **T** - Timely | Tests should be written close in time to the code they test |

## Additional Best Practices

1. **Test behavior, not implementation** -- Test what the code does, not how it does it. This makes tests resilient to refactoring.
2. **Use descriptive test names** -- A test name should describe the scenario and expected outcome. `test('returns 404 when user not found')` is better than `test('test3')`.
3. **One assertion per concept** -- Each test should verify one logical concept. Multiple assertions are fine if they all verify the same behavior.
4. **Do not test framework code** -- Trust that your frameworks and libraries work. Test your code.
5. **Keep tests deterministic** -- Avoid relying on system time, random values, or network calls in unit tests.
6. **Clean up after tests** -- Reset databases, clear mocks, and remove test files in teardown hooks.
7. **Use factories and builders** -- Create helper functions to generate test data instead of duplicating setup code.

```javascript
// Test data factory
function createUser(overrides = {}) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides
  };
}

test('admin can delete users', () => {
  const admin = createUser({ role: 'admin' });
  const target = createUser({ id: 2, name: 'Other User' });
  // ...
});
```

# Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [pytest Documentation](https://docs.pytest.org/)
- [Go Testing Package](https://pkg.go.dev/testing)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [k6 Load Testing](https://k6.io/docs/)
- [Martin Fowler - TestPyramid](https://martinfowler.com/bliki/TestPyramid.html)
- [The Art of Unit Testing - Roy Osherove](https://www.artofunittesting.com/)
- [Google Testing Blog](https://testing.googleblog.com/)
- [Test-Driven Development by Example - Kent Beck](https://www.oreilly.com/library/view/test-driven-development/0321146530/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
