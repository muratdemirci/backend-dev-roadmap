# Domain-Driven Design (DDD)

Domain-Driven Design is an approach to software development that places the business domain at the center of the design process. Introduced by Eric Evans in his 2003 book *Domain-Driven Design: Tackling Complexity in the Heart of Software*, DDD provides patterns and practices for building complex systems where the codebase reflects the language and structure of the business it serves.

---

## When to Use DDD

DDD is most valuable when:
- The business domain is complex and evolving
- Domain experts are available for collaboration
- The system will be maintained and extended over a long period
- Multiple teams work on different parts of the domain

DDD adds overhead and is not justified for simple CRUD applications or short-lived projects.

## Ubiquitous Language

Ubiquitous language is the shared vocabulary used by developers and domain experts in conversation, documentation, and code. Every term means the same thing to everyone, and the code uses these terms directly.

```python
# Without ubiquitous language: technical terms
class DataProcessor:
    def execute_workflow(self, record):
        self.validate_record(record)
        self.persist_record(record)
        self.trigger_notification(record)

# With ubiquitous language: domain terms
class LoanApplication:
    def submit(self, application):
        self.verify_applicant_eligibility(application)
        self.record_application(application)
        self.notify_underwriting_team(application)
```

The second version uses terms that a loan officer would recognize and use in conversation.

## Bounded Contexts

A bounded context is an explicit boundary within which a particular domain model is defined and consistent. Different parts of the business may use the same term with different meanings -- bounded contexts acknowledge this.

```
E-commerce System:

  [Sales Context]               [Shipping Context]
  - Customer: name, email,      - Customer: name, address,
    payment info                   delivery preferences
  - Order: items, total, status - Order: weight, dimensions,
                                   tracking number

  [Inventory Context]
  - Product: SKU, quantity,
    reorder level
```

In the Sales context, an "Order" is about pricing and payment. In the Shipping context, it is about weight, dimensions, and delivery. These are different models for the same real-world concept, and that is by design.

## Strategic Design Concepts

| Concept | Description |
|---------|-------------|
| **Bounded Context** | A boundary where a model is consistent and terms have precise meaning |
| **Context Map** | A diagram showing how bounded contexts relate to each other |
| **Ubiquitous Language** | Shared language between developers and domain experts within a context |
| **Subdomain** | A part of the business domain (core, supporting, or generic) |

### Types of Subdomains

| Type | Description | Example | Investment Level |
|------|-------------|---------|-----------------|
| **Core** | The competitive advantage of the business | Recommendation engine, pricing algorithm | Highest |
| **Supporting** | Necessary but not a differentiator | User management, reporting | Moderate |
| **Generic** | Solved problems with off-the-shelf solutions | Authentication, email sending | Lowest (buy or use a library) |

## Tactical Design Patterns

### Entities

Objects with a distinct identity that persists over time. Two entities are equal if they have the same identity, regardless of other attributes.

```python
class User:
    def __init__(self, user_id: str, name: str, email: str):
        self.id = user_id    # Identity
        self.name = name
        self.email = email

    def __eq__(self, other):
        return isinstance(other, User) and self.id == other.id

    def change_email(self, new_email: str):
        # Domain logic: validate and update
        if not new_email or '@' not in new_email:
            raise ValueError("Invalid email")
        self.email = new_email
```

### Value Objects

Objects defined entirely by their attributes, with no conceptual identity. They are immutable and interchangeable when their values are equal.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Money:
    amount: float
    currency: str

    def add(self, other: 'Money') -> 'Money':
        if self.currency != other.currency:
            raise ValueError("Cannot add different currencies")
        return Money(self.amount + other.amount, self.currency)

@dataclass(frozen=True)
class Address:
    street: str
    city: str
    zip_code: str
    country: str

# Two Money objects with the same values are equal
price_a = Money(10.00, "USD")
price_b = Money(10.00, "USD")
assert price_a == price_b  # True
```

### Aggregates

An aggregate is a cluster of entities and value objects treated as a single unit for data changes. Every aggregate has a root entity (the aggregate root) that controls access to the internal objects.

```python
class Order:
    """Aggregate root for the Order aggregate."""
    def __init__(self, order_id: str, customer_id: str):
        self.id = order_id
        self.customer_id = customer_id
        self.items = []         # Internal entities
        self.status = "draft"

    def add_item(self, product_id: str, quantity: int, price: Money):
        if self.status != "draft":
            raise ValueError("Cannot modify a submitted order")
        item = OrderItem(product_id, quantity, price)
        self.items.append(item)

    def submit(self):
        if not self.items:
            raise ValueError("Cannot submit an empty order")
        self.status = "submitted"

    def total(self) -> Money:
        return sum((item.subtotal() for item in self.items), Money(0, "USD"))

class OrderItem:
    """Entity within the Order aggregate (not accessed directly)."""
    def __init__(self, product_id: str, quantity: int, price: Money):
        self.product_id = product_id
        self.quantity = quantity
        self.price = price

    def subtotal(self) -> Money:
        return Money(self.price.amount * self.quantity, self.price.currency)
```

**Aggregate rules:**
- External objects can only reference the aggregate root, not internal entities.
- All changes go through the aggregate root, which enforces invariants.
- Aggregates are the unit of persistence -- save and load the entire aggregate.

### Repositories

Repositories provide an abstraction for retrieving and persisting aggregates. They hide the details of data storage from the domain model.

```python
from abc import ABC, abstractmethod

class OrderRepository(ABC):
    @abstractmethod
    def find_by_id(self, order_id: str) -> Order:
        pass

    @abstractmethod
    def save(self, order: Order) -> None:
        pass

class PostgresOrderRepository(OrderRepository):
    def __init__(self, connection):
        self.conn = connection

    def find_by_id(self, order_id):
        # Query database and reconstruct Order aggregate
        ...

    def save(self, order):
        # Persist Order aggregate to database
        ...
```

### Domain Events

Domain events represent something meaningful that happened in the domain. They enable loose coupling between aggregates and bounded contexts.

```python
class OrderSubmitted:
    def __init__(self, order_id: str, customer_id: str, total: Money):
        self.order_id = order_id
        self.customer_id = customer_id
        self.total = total
        self.occurred_at = datetime.utcnow()

# When an order is submitted, publish the event
class Order:
    def submit(self):
        if not self.items:
            raise ValueError("Cannot submit an empty order")
        self.status = "submitted"
        return OrderSubmitted(self.id, self.customer_id, self.total())
```

## Resources

- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Implementing Domain-Driven Design - Vaughn Vernon](https://www.oreilly.com/library/view/implementing-domain-driven-design/9780133039900/)
- [Domain-Driven Design Quickly (Free)](https://www.infoq.com/minibooks/domain-driven-design-quickly/)
- [Martin Fowler - DDD](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Awesome DDD - GitHub](https://github.com/heynickc/awesome-ddd)
- [DDD Reference - Eric Evans (Free PDF)](https://www.domainlanguage.com/ddd/reference/)
