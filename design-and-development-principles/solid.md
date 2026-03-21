# SOLID Principles

SOLID is an acronym for five object-oriented design principles introduced by Robert C. Martin (Uncle Bob). These principles guide developers in creating software that is maintainable, flexible, and resilient to change. When applied correctly, SOLID produces code that is easier to understand, test, and extend.

---

## Overview

| Letter | Principle | Core Idea |
|--------|-----------|-----------|
| **S** | Single Responsibility | A class should have one reason to change |
| **O** | Open/Closed | Open for extension, closed for modification |
| **L** | Liskov Substitution | Subtypes must be substitutable for their base types |
| **I** | Interface Segregation | Prefer small, focused interfaces over large ones |
| **D** | Dependency Inversion | Depend on abstractions, not concrete implementations |

## S -- Single Responsibility Principle (SRP)

**A class should have one, and only one, reason to change.**

Each class or module should be responsible for a single part of the functionality. When a class handles multiple concerns, changes to one concern risk breaking the other.

```javascript
// Bad: handles user data, persistence, AND email
class UserManager {
  createUser(name, email) { /* ... */ }
  saveToDatabase(user) { /* ... */ }
  sendWelcomeEmail(user) { /* ... */ }
}

// Good: each class has one responsibility
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class UserRepository {
  save(user) { /* database logic */ }
  findById(id) { /* database logic */ }
}

class EmailService {
  sendWelcome(user) { /* email logic */ }
}
```

## O -- Open/Closed Principle (OCP)

**Software entities should be open for extension but closed for modification.**

You should be able to add new behavior without changing existing, tested code. This is achieved through abstraction and polymorphism.

```python
# Bad: adding a new payment method requires modifying existing code
def process_payment(method, amount):
    if method == "credit_card":
        charge_credit_card(amount)
    elif method == "paypal":
        send_paypal(amount)
    # Every new method means editing this function

# Good: extend by adding new classes, not editing existing ones
class PaymentProcessor:
    def process(self, amount):
        raise NotImplementedError

class CreditCardProcessor(PaymentProcessor):
    def process(self, amount):
        return charge_credit_card(amount)

class PayPalProcessor(PaymentProcessor):
    def process(self, amount):
        return send_paypal(amount)

# Adding Stripe requires ZERO changes to existing code
class StripeProcessor(PaymentProcessor):
    def process(self, amount):
        return charge_stripe(amount)
```

## L -- Liskov Substitution Principle (LSP)

**Objects of a superclass should be replaceable with objects of a subclass without breaking the application.**

If class B extends class A, then B should be usable anywhere A is expected without surprising behavior.

```typescript
// Violation: Square changes Rectangle's expected behavior
class Rectangle {
  constructor(protected width: number, protected height: number) {}

  setWidth(w: number) { this.width = w; }
  setHeight(h: number) { this.height = h; }
  getArea(): number { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(w: number) { this.width = w; this.height = w; }  // Breaks LSP
  setHeight(h: number) { this.width = h; this.height = h; }
}

// This test passes for Rectangle but FAILS for Square
function testRectangle(rect: Rectangle) {
  rect.setWidth(5);
  rect.setHeight(4);
  console.assert(rect.getArea() === 20);  // Square gives 16!
}

// Fix: use separate, unrelated classes or a common Shape interface
interface Shape {
  getArea(): number;
}

class RectangleFixed implements Shape {
  constructor(private width: number, private height: number) {}
  getArea(): number { return this.width * this.height; }
}

class SquareFixed implements Shape {
  constructor(private side: number) {}
  getArea(): number { return this.side * this.side; }
}
```

## I -- Interface Segregation Principle (ISP)

**Clients should not be forced to depend on interfaces they do not use.**

Instead of one fat interface, create smaller, focused interfaces.

```java
// Bad: Robot is forced to implement methods it cannot use
interface Worker {
    void work();
    void eat();
    void sleep();
}

class Robot implements Worker {
    public void work() { /* works */ }
    public void eat() { throw new UnsupportedOperationException(); }
    public void sleep() { throw new UnsupportedOperationException(); }
}

// Good: segregated interfaces
interface Workable {
    void work();
}

interface Feedable {
    void eat();
}

interface Restable {
    void sleep();
}

class Human implements Workable, Feedable, Restable {
    public void work() { /* ... */ }
    public void eat() { /* ... */ }
    public void sleep() { /* ... */ }
}

class Robot implements Workable {
    public void work() { /* ... */ }
}
```

## D -- Dependency Inversion Principle (DIP)

**High-level modules should not depend on low-level modules. Both should depend on abstractions.**

```python
from abc import ABC, abstractmethod

# Abstraction
class NotificationSender(ABC):
    @abstractmethod
    def send(self, recipient: str, message: str) -> None:
        pass

# Low-level implementations
class EmailSender(NotificationSender):
    def send(self, recipient, message):
        print(f"Email to {recipient}: {message}")

class SmsSender(NotificationSender):
    def send(self, recipient, message):
        print(f"SMS to {recipient}: {message}")

# High-level module depends on abstraction, not implementation
class OrderService:
    def __init__(self, notifier: NotificationSender):
        self.notifier = notifier

    def place_order(self, order):
        # process order...
        self.notifier.send(order.customer_email, "Order confirmed!")

# Swap implementations without changing OrderService
order_service = OrderService(EmailSender())
order_service = OrderService(SmsSender())
```

## When to Apply SOLID

SOLID principles are guidelines, not rigid rules. Apply them when:
- A class is growing too large or handling multiple concerns (SRP)
- You find yourself modifying existing code to add new features (OCP)
- A subclass behaves differently than expected (LSP)
- Classes implement methods they do not need (ISP)
- High-level logic is tightly coupled to specific implementations (DIP)

> **Warning:** Over-engineering with SOLID can lead to unnecessary abstraction. A simple script that runs once does not need five layers of indirection.

## Resources

- [SOLID Principles - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)
- [Clean Architecture by Robert C. Martin](https://www.oreilly.com/library/view/clean-architecture-a/9780134494272/)
- [Refactoring Guru - SOLID](https://refactoring.guru/refactoring/smells)
- [SOLID Principles - Wikipedia](https://en.wikipedia.org/wiki/SOLID)
- [Head First Design Patterns](https://www.oreilly.com/library/view/head-first-design/9781492077992/)
