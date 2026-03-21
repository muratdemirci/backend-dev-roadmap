# Unit Testing

Unit testing is the practice of testing individual units of code -- functions, methods, or classes -- in isolation from the rest of the application. Each test verifies that a single piece of logic behaves correctly for a given set of inputs. Unit tests form the foundation of the testing pyramid and are the fastest, cheapest, and most numerous tests in a well-tested codebase.

---

## Why Unit Testing Matters

- **Catch bugs early** -- Errors found in unit tests cost minutes to fix; in production, they cost hours.
- **Enable refactoring** -- With a solid unit test suite, you can change code confidently knowing that regressions will be caught.
- **Document behavior** -- Tests describe what the code does and serve as executable specifications.
- **Improve design** -- Code that is hard to unit test is often tightly coupled or has too many responsibilities.

## The AAA Pattern

Every unit test should follow three distinct phases:

```
Arrange  -->  Set up the test data, mocks, and dependencies
Act      -->  Execute the function or method under test
Assert   -->  Verify the result matches the expected outcome
```

```javascript
// Jest example using AAA pattern
test('calculates total price with discount', () => {
  // Arrange
  const items = [
    { name: 'Widget', price: 25.00 },
    { name: 'Gadget', price: 15.00 }
  ];
  const discountPercent = 10;

  // Act
  const total = calculateTotal(items, discountPercent);

  // Assert
  expect(total).toBe(36.00);
});
```

## Isolation and Mocking

The defining characteristic of a unit test is isolation. The unit under test should not depend on databases, file systems, network calls, or other modules. External dependencies are replaced with test doubles.

| Test Double | Purpose |
|-------------|---------|
| **Mock** | Records calls and verifies interactions occurred |
| **Stub** | Returns predetermined values without real logic |
| **Spy** | Wraps a real object and records calls while keeping original behavior |
| **Fake** | A simplified working implementation (e.g., in-memory database) |

### Mocking in Jest (JavaScript)

```javascript
const userService = require('./userService');
const db = require('./db');

jest.mock('./db');

test('getUser returns user from database', async () => {
  // Arrange
  db.findById.mockResolvedValue({ id: 1, name: 'Alice' });

  // Act
  const user = await userService.getUser(1);

  // Assert
  expect(user.name).toBe('Alice');
  expect(db.findById).toHaveBeenCalledWith(1);
  expect(db.findById).toHaveBeenCalledTimes(1);
});
```

### Mocking in pytest (Python)

```python
from unittest.mock import MagicMock, patch
from user_service import UserService

def test_get_user_returns_user():
    # Arrange
    mock_repo = MagicMock()
    mock_repo.find_by_id.return_value = {"id": 1, "name": "Alice"}
    service = UserService(repository=mock_repo)

    # Act
    user = service.get_user(1)

    # Assert
    assert user["name"] == "Alice"
    mock_repo.find_by_id.assert_called_once_with(1)
```

### Testing in JUnit 5 (Java)

```java
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {
    @Test
    void getUserReturnsUser() {
        // Arrange
        UserRepository repo = mock(UserRepository.class);
        when(repo.findById(1L)).thenReturn(new User(1L, "Alice"));
        UserService service = new UserService(repo);

        // Act
        User user = service.getUser(1L);

        // Assert
        assertEquals("Alice", user.getName());
        verify(repo).findById(1L);
    }
}
```

## Popular Frameworks

| Language | Frameworks | Key Features |
|----------|-----------|--------------|
| JavaScript/TypeScript | **Jest**, Vitest, Mocha | Snapshot testing, built-in mocking, parallel |
| Python | **pytest**, unittest | Fixtures, parametrize, plugins |
| Java | **JUnit 5**, TestNG | Annotations, extensions, parameterized tests |
| Go | Built-in `testing` | Table-driven tests, benchmarks |
| C# | **xUnit**, NUnit, MSTest | Data theories, dependency injection |
| Rust | Built-in `#[test]` | Compile-time guarantees, doc tests |

## Best Practices

1. **Test one concept per test** -- A test should verify a single behavior. Multiple assertions are fine if they all relate to the same behavior.
2. **Use descriptive names** -- `test_returns_404_when_user_not_found` is better than `test_get_user_error`.
3. **Keep tests fast** -- Unit tests should run in milliseconds. If a test needs a database, it is an integration test.
4. **Avoid testing implementation details** -- Test what the code does, not how it does it. This makes tests resilient to refactoring.
5. **Make tests deterministic** -- Avoid system time, random values, or network calls. Use fixtures and mocks.
6. **Use test data factories** -- Create helper functions to generate test data instead of duplicating setup.

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

test('admin can delete other users', () => {
  const admin = createUser({ role: 'admin' });
  const target = createUser({ id: 2 });
  expect(canDelete(admin, target)).toBe(true);
});

test('regular user cannot delete others', () => {
  const user = createUser({ role: 'user' });
  const target = createUser({ id: 2 });
  expect(canDelete(user, target)).toBe(false);
});
```

## What Not to Unit Test

- **Framework and library code** -- Trust that third-party code works.
- **Trivial getters/setters** -- No logic means no value in testing.
- **Private methods directly** -- Test them indirectly through public methods.
- **Configuration and wiring** -- This belongs in integration tests.

## Running Unit Tests

```bash
# JavaScript (Jest)
npx jest --watch

# Python (pytest)
pytest tests/unit/ -v

# Java (Maven)
mvn test

# Go
go test ./... -v -short
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [pytest Documentation](https://docs.pytest.org/)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [The Art of Unit Testing - Roy Osherove](https://www.artofunittesting.com/)
- [Martin Fowler - Unit Test](https://martinfowler.com/bliki/UnitTest.html)
- [Google Testing Blog](https://testing.googleblog.com/)
