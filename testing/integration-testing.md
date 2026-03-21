# Integration Testing

Integration testing verifies that multiple components of a system work correctly together. Unlike unit tests that isolate individual functions with mocks, integration tests exercise real interactions between modules, databases, APIs, message queues, and external services. They sit in the middle of the testing pyramid -- fewer in number than unit tests but more comprehensive in scope.

---

## Why Integration Testing Matters

Unit tests confirm that individual pieces work in isolation, but they cannot verify that those pieces work together correctly. Integration tests catch issues like:

- Incorrect database queries or schema mismatches
- Broken API contracts between services
- Serialization/deserialization errors
- Misconfigured middleware or authentication
- Transaction and concurrency problems

## Types of Integration Tests

| Type | What It Tests | Example |
|------|--------------|---------|
| **Database Integration** | Application code with a real database | Verify that a repository correctly saves and retrieves entities |
| **API Integration** | HTTP endpoints with real middleware and routing | Send a POST request and verify the response and database state |
| **Service Integration** | Communication between microservices | Service A calls Service B and processes the response |
| **Message Queue Integration** | Producers and consumers with a real broker | Publish a message and verify the consumer processes it |

## Database Integration Testing

```javascript
// Jest + Supertest with a real PostgreSQL database
const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  await db.seed.run();
});

afterAll(async () => {
  await db.destroy();
});

describe('POST /api/users', () => {
  test('creates a new user and returns 201', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Alice', email: 'alice@example.com' })
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body.name).toBe('Alice');
    expect(response.body.id).toBeDefined();

    // Verify the user was actually persisted
    const user = await db('users').where({ email: 'alice@example.com' }).first();
    expect(user).toBeDefined();
    expect(user.name).toBe('Alice');
  });

  test('returns 400 for invalid email', async () => {
    await request(app)
      .post('/api/users')
      .send({ name: 'Bob', email: 'not-an-email' })
      .expect(400);
  });
});
```

## API Integration Testing with Python

```python
import pytest
from app import create_app, db

@pytest.fixture
def client():
    app = create_app(config='testing')
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()

def test_create_user(client):
    response = client.post('/api/users', json={
        'name': 'Alice',
        'email': 'alice@example.com'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['name'] == 'Alice'
    assert 'id' in data

def test_get_users_returns_list(client):
    # Create two users
    client.post('/api/users', json={'name': 'Alice', 'email': 'alice@example.com'})
    client.post('/api/users', json={'name': 'Bob', 'email': 'bob@example.com'})

    response = client.get('/api/users')
    assert response.status_code == 200
    assert len(response.get_json()) == 2

def test_get_user_not_found(client):
    response = client.get('/api/users/999')
    assert response.status_code == 404
```

## Testcontainers

Testcontainers is a library that provides lightweight, disposable Docker containers for integration tests. It ensures your tests run against real databases and services, not mocks or in-memory substitutes.

```javascript
// Node.js with Testcontainers
const { PostgreSqlContainer } = require('@testcontainers/postgresql');

let container;
let connectionString;

beforeAll(async () => {
  container = await new PostgreSqlContainer()
    .withDatabase('testdb')
    .withUsername('testuser')
    .withPassword('testpass')
    .start();

  connectionString = container.getConnectionUri();
  // Initialize your app's database connection with this URI
}, 30000);

afterAll(async () => {
  await container.stop();
});
```

```python
# Python with testcontainers
from testcontainers.postgres import PostgresContainer

def test_with_real_postgres():
    with PostgresContainer("postgres:15") as postgres:
        connection_url = postgres.get_connection_url()
        # Use connection_url to configure your app
        # Run your integration tests against a real PostgreSQL instance
```

```java
// Java with Testcontainers
@Testcontainers
class UserRepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @Test
    void shouldSaveAndRetrieveUser() {
        // postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()
        // Configure your DataSource with these values
    }
}
```

## Service Integration Testing

When testing communication between microservices, you have two strategies:

| Strategy | Description | Pros | Cons |
|----------|-------------|------|------|
| **Real service** | Run the dependency as a Docker container | Tests real behavior | Slower, more complex setup |
| **Contract testing** | Verify request/response contracts without the real service | Fast, independent | Does not catch runtime issues |
| **WireMock / Mock server** | Stub the external service | Fast, deterministic | May drift from real API |

```javascript
// WireMock-style stub for external service
const nock = require('nock');

test('fetches user profile from external service', async () => {
  nock('https://api.external.com')
    .get('/users/123')
    .reply(200, { id: 123, name: 'Alice', verified: true });

  const profile = await userService.fetchExternalProfile(123);

  expect(profile.name).toBe('Alice');
  expect(profile.verified).toBe(true);
});
```

## Best Practices

1. **Use real dependencies when possible** -- Prefer Testcontainers over in-memory databases like SQLite when your production uses PostgreSQL.
2. **Isolate test data** -- Each test should set up its own data and clean up afterward. Use transactions that roll back, or truncate tables between tests.
3. **Keep integration tests focused** -- Test one integration point per test, not the entire system.
4. **Separate from unit tests** -- Run integration tests in a separate test suite so that unit tests remain fast.
5. **Use CI-friendly setups** -- Docker Compose or Testcontainers make it easy to spin up dependencies in CI.
6. **Test failure scenarios** -- Verify that your application handles database timeouts, connection failures, and invalid responses gracefully.

## Running Integration Tests

```bash
# Separate integration tests from unit tests
npx jest --testPathPattern=integration    # JavaScript
pytest tests/integration/ -v              # Python
mvn verify -Pfailsafe                     # Java (Maven Failsafe)
go test ./... -tags=integration           # Go (build tags)
```

```yaml
# GitHub Actions with service containers
jobs:
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: testdb
          POSTGRES_PASSWORD: testpass
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:testpass@localhost:5432/testdb
```

## Resources

- [Testcontainers](https://testcontainers.com/)
- [Supertest - HTTP Assertions](https://github.com/ladjs/supertest)
- [Martin Fowler - Integration Test](https://martinfowler.com/bliki/IntegrationTest.html)
- [Nock - HTTP Mocking](https://github.com/nock/nock)
- [WireMock](https://wiremock.org/)
- [Pact - Contract Testing](https://pact.io/)
