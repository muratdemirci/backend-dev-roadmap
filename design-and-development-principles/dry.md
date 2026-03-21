# DRY (Don't Repeat Yourself)

DRY is a software development principle formulated by Andy Hunt and Dave Thomas in *The Pragmatic Programmer* (1999). It states: **"Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."** DRY is about eliminating duplication of knowledge and logic, not just duplicated lines of code. When applied well, it reduces bugs, simplifies maintenance, and makes code easier to evolve.

---

## What DRY Really Means

DRY is often misunderstood as "never write similar-looking code." The real meaning is deeper: every concept, rule, or piece of business logic should exist in exactly one place. When you need to change that logic, you change it in one place, and the change propagates correctly throughout the system.

**DRY applies to:**
- Business logic and rules
- Database schemas and data definitions
- Configuration values
- API contracts and documentation
- Build and deployment scripts

## Code Duplication Example

```javascript
// WET (Write Everything Twice): validation logic duplicated
function createUser(email, name) {
  if (!email || !email.includes('@') || email.length > 254) {
    throw new Error('Invalid email');
  }
  // ... create user
}

function updateUserEmail(userId, email) {
  if (!email || !email.includes('@') || email.length > 254) {
    throw new Error('Invalid email');
  }
  // ... update email
}

function sendInvitation(email) {
  if (!email || !email.includes('@') || email.length > 254) {
    throw new Error('Invalid email');
  }
  // ... send invitation
}

// DRY: single source of truth for email validation
function validateEmail(email) {
  if (!email || !email.includes('@') || email.length > 254) {
    throw new Error('Invalid email');
  }
}

function createUser(email, name) {
  validateEmail(email);
  // ... create user
}

function updateUserEmail(userId, email) {
  validateEmail(email);
  // ... update email
}

function sendInvitation(email) {
  validateEmail(email);
  // ... send invitation
}
```

## Types of Duplication

| Type | Description | Example |
|------|-------------|---------|
| **Code duplication** | Same logic copied to multiple places | Validation in multiple handlers |
| **Data duplication** | Same information stored in multiple locations | User age stored AND birth date stored |
| **Knowledge duplication** | Same business rule encoded in multiple ways | Discount logic in both frontend and backend |
| **Documentation duplication** | Comments that repeat what the code says | `i++; // increment i` |

## Techniques to Eliminate Duplication

### Extract Functions

```python
# Before: repeated pattern
def get_active_users():
    users = db.query("SELECT * FROM users WHERE deleted_at IS NULL")
    return [u for u in users if u.last_login > thirty_days_ago()]

def get_active_admins():
    admins = db.query("SELECT * FROM users WHERE role='admin' AND deleted_at IS NULL")
    return [a for a in admins if a.last_login > thirty_days_ago()]

# After: extract shared logic
def is_active(user):
    return user.last_login > thirty_days_ago()

def get_active_users():
    users = db.query("SELECT * FROM users WHERE deleted_at IS NULL")
    return [u for u in users if is_active(u)]

def get_active_admins():
    admins = db.query("SELECT * FROM users WHERE role='admin' AND deleted_at IS NULL")
    return [a for a in admins if is_active(a)]
```

### Use Constants

```javascript
// WET: magic numbers scattered everywhere
if (password.length < 8) { /* ... */ }
// ... 50 lines later
const minLength = 'Password must be at least 8 characters';
// ... in another file
validator.minLength(8);

// DRY: single constant
const MIN_PASSWORD_LENGTH = 8;

if (password.length < MIN_PASSWORD_LENGTH) { /* ... */ }
const message = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
validator.minLength(MIN_PASSWORD_LENGTH);
```

### Templates and Generators

When the same structure is repeated across multiple files (API routes, database migrations, configuration), consider using code generators or templates rather than copying and modifying.

## When DRY Goes Too Far (WET / AHA)

Over-applying DRY creates premature abstractions that are worse than the duplication they replace. Two related concepts push back on excessive DRY:

**WET (Write Everything Twice)** -- Allow duplication until you see the same logic three times. At two occurrences, the abstraction might be premature.

**AHA (Avoid Hasty Abstractions)** -- Coined by Kent C. Dodds, AHA suggests that you should prefer duplication over the wrong abstraction. Wait until the pattern is clear before abstracting.

```python
# Premature DRY: forced abstraction that couples unrelated logic
def process_entity(entity, entity_type):
    if entity_type == "user":
        validate_user(entity)
        save_user(entity)
        notify_user(entity)
    elif entity_type == "order":
        validate_order(entity)
        save_order(entity)
        notify_warehouse(entity)
    # This "shared" function does not actually share any logic

# Better: separate functions with some duplication are clearer
def process_user(user):
    validate_user(user)
    save_user(user)
    notify_user(user)

def process_order(order):
    validate_order(order)
    save_order(order)
    notify_warehouse(order)
```

## The Rule of Three

A common guideline: tolerate duplication the first time, note it the second time, and refactor on the third occurrence. By the third time, the pattern is clear enough to create a correct abstraction.

```
1st occurrence: Write the code
2nd occurrence: Notice the duplication, leave it
3rd occurrence: Refactor into a shared abstraction
```

## DRY Beyond Code

| Area | DRY Approach |
|------|-------------|
| **Database** | Normalize schemas to avoid storing the same data in multiple tables |
| **API documentation** | Generate docs from code (OpenAPI/Swagger) instead of maintaining separately |
| **Configuration** | Use environment variables and shared config files, not hardcoded values |
| **Infrastructure** | Use Terraform modules or Ansible roles instead of duplicating scripts |

## Resources

- [The Pragmatic Programmer - Andy Hunt & Dave Thomas](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/)
- [AHA Programming - Kent C. Dodds](https://kentcdodds.com/blog/aha-programming)
- [DRY - Wikipedia](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- [The Wrong Abstraction - Sandi Metz](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)
- [Martin Fowler - Refactoring](https://martinfowler.com/books/refactoring.html)
