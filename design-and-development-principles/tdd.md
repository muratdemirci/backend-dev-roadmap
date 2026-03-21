# TDD (Test-Driven Development)

Test-Driven Development is a software development methodology where you write tests before writing the production code. Popularized by Kent Beck in his 2002 book *Test-Driven Development: By Example*, TDD follows a strict cycle of writing a failing test, making it pass with minimal code, and then refactoring. This approach produces well-tested, well-designed code by making testing an integral part of the development process rather than an afterthought.

---

## The Red-Green-Refactor Cycle

TDD follows three repeating steps:

```
1. RED      -->  Write a test that fails (because the code does not exist yet)
2. GREEN    -->  Write the minimum code to make the test pass
3. REFACTOR -->  Improve the code while keeping all tests green
4. REPEAT
```

Each cycle should take minutes, not hours. Small, rapid iterations keep you focused and provide constant feedback.

## TDD in Action: A Walkthrough

Let us build a `PasswordValidator` using TDD.

### Step 1: RED -- Write a failing test

```python
# test_password_validator.py
from password_validator import validate_password

def test_rejects_short_password():
    result = validate_password("abc")
    assert result.is_valid is False
    assert "at least 8 characters" in result.errors
```

This test fails because `password_validator.py` does not exist yet.

### Step 2: GREEN -- Write minimum code to pass

```python
# password_validator.py
from dataclasses import dataclass, field

@dataclass
class ValidationResult:
    is_valid: bool
    errors: list = field(default_factory=list)

def validate_password(password: str) -> ValidationResult:
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")
    return ValidationResult(is_valid=len(errors) == 0, errors=errors)
```

The test passes. Move on.

### Step 3: RED -- Add the next test

```python
def test_rejects_password_without_uppercase():
    result = validate_password("abcdefgh")
    assert result.is_valid is False
    assert "uppercase letter" in result.errors[0]
```

### Step 4: GREEN -- Make it pass

```python
def validate_password(password: str) -> ValidationResult:
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")
    return ValidationResult(is_valid=len(errors) == 0, errors=errors)
```

### Step 5: REFACTOR

```python
def validate_password(password: str) -> ValidationResult:
    rules = [
        (lambda p: len(p) >= 8, "Password must be at least 8 characters"),
        (lambda p: any(c.isupper() for c in p), "Password must contain at least one uppercase letter"),
    ]
    errors = [msg for check, msg in rules if not check(password)]
    return ValidationResult(is_valid=len(errors) == 0, errors=errors)
```

All tests still pass. The structure is cleaner and easy to extend with more rules.

## TDD in JavaScript (Jest)

```javascript
// stack.test.js
const Stack = require('./stack');

describe('Stack', () => {
  test('new stack is empty', () => {
    const stack = new Stack();
    expect(stack.isEmpty()).toBe(true);
  });

  test('push adds element', () => {
    const stack = new Stack();
    stack.push(1);
    expect(stack.isEmpty()).toBe(false);
    expect(stack.size()).toBe(1);
  });

  test('pop returns last pushed element', () => {
    const stack = new Stack();
    stack.push(1);
    stack.push(2);
    expect(stack.pop()).toBe(2);
    expect(stack.size()).toBe(1);
  });

  test('pop on empty stack throws', () => {
    const stack = new Stack();
    expect(() => stack.pop()).toThrow('Stack is empty');
  });
});
```

```javascript
// stack.js -- built incrementally through TDD
class Stack {
  constructor() { this.items = []; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
  push(item) { this.items.push(item); }
  pop() {
    if (this.isEmpty()) throw new Error('Stack is empty');
    return this.items.pop();
  }
}

module.exports = Stack;
```

## Benefits of TDD

| Benefit | Description |
|---------|-------------|
| **High test coverage** | Every line of production code exists to pass a test |
| **Better design** | Writing tests first forces you to think about the interface before the implementation |
| **Confidence in changes** | A comprehensive test suite catches regressions immediately |
| **Living documentation** | Tests describe what the code does in executable form |
| **Fewer debugging sessions** | Bugs are caught within minutes of being introduced |
| **Smaller functions** | TDD naturally leads to focused, single-responsibility functions |

## When to Use TDD

TDD works best when:
- Requirements are clear or can be expressed as specific behaviors
- The code has well-defined inputs and outputs
- You are building libraries, APIs, or business logic
- You need high confidence in correctness (financial, medical, security)

TDD may not be ideal for:
- Exploratory prototyping where requirements are unknown
- UI layout and styling work
- One-off scripts that will not be maintained
- Highly integrated code that requires complex setup for every test

## Common Mistakes

1. **Writing too many tests at once** -- TDD means one test at a time. Write one test, make it pass, refactor, repeat.
2. **Writing too much code to pass a test** -- Write the minimum code. "Fake it till you make it."
3. **Skipping the refactor step** -- Refactoring is where design emerges. Skipping it leads to messy code.
4. **Testing implementation instead of behavior** -- Test what the code does, not how it does it.
5. **Ignoring failing tests** -- A failing test means either the code is wrong or the test is wrong. Investigate immediately.

## BDD: Behavior-Driven Development

BDD extends TDD by writing tests in natural language that describes behavior from the user's perspective. It uses a Given-When-Then format.

```gherkin
# login.feature (Gherkin syntax)
Feature: User Login

  Scenario: Successful login with valid credentials
    Given a registered user with email "alice@example.com"
    And the user's password is "SecurePass123"
    When the user logs in with email "alice@example.com" and password "SecurePass123"
    Then the login should succeed
    And the user should receive an access token

  Scenario: Failed login with wrong password
    Given a registered user with email "alice@example.com"
    When the user logs in with email "alice@example.com" and password "wrong"
    Then the login should fail
    And the error message should be "Invalid credentials"
```

| Aspect | TDD | BDD |
|--------|-----|-----|
| **Focus** | Code correctness | User behavior |
| **Language** | Programming language | Natural language (Given/When/Then) |
| **Audience** | Developers | Developers + product owners |
| **Tools** | Jest, pytest, JUnit | Cucumber, Behave, SpecFlow |
| **Granularity** | Unit level | Feature/scenario level |

## TDD and the Testing Pyramid

TDD primarily drives unit tests (the base of the pyramid), but the methodology can be applied at any level:

- **Unit TDD** -- Most common; test individual functions and classes
- **Acceptance TDD (ATDD)** -- Write acceptance criteria as tests before building features
- **BDD** -- Write behavior specifications before implementation

## Resources

- [Test-Driven Development: By Example - Kent Beck](https://www.oreilly.com/library/view/test-driven-development/0321146530/)
- [Growing Object-Oriented Software, Guided by Tests - Freeman & Pryce](http://www.growing-object-oriented-software.com/)
- [Martin Fowler - Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [The Cucumber Book - BDD](https://pragprog.com/titles/hwcuc2/the-cucumber-book-second-edition/)
- [Kent Beck's Rules of TDD](https://www.youtube.com/watch?v=ElaYnExYe-c)
- [Uncle Bob - The Three Rules of TDD](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd)
