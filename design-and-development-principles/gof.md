# GoF Design Patterns

The Gang of Four (GoF) design patterns are 23 reusable solutions to commonly occurring problems in object-oriented software design. They were cataloged by Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides in their 1994 book *Design Patterns: Elements of Reusable Object-Oriented Software*. These patterns remain foundational knowledge for software developers and are widely referenced in codebases, frameworks, and technical discussions.

---

## Three Categories

GoF patterns are organized into three categories based on their purpose:

| Category | Purpose | Count |
|----------|---------|-------|
| **Creational** | How objects are created | 5 |
| **Structural** | How objects are composed and connected | 7 |
| **Behavioral** | How objects communicate and distribute responsibility | 11 |

## Creational Patterns

Creational patterns abstract the instantiation process, making systems independent of how objects are created.

### Singleton

Ensures a class has only one instance and provides a global access point.

```python
class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.connection = create_connection()
        return cls._instance

db1 = Database()
db2 = Database()
assert db1 is db2  # Same instance
```

### Factory Method

Defines an interface for creating objects but lets subclasses decide which class to instantiate.

```javascript
class NotificationFactory {
  static create(type, message) {
    switch (type) {
      case 'email': return new EmailNotification(message);
      case 'sms':   return new SmsNotification(message);
      case 'push':  return new PushNotification(message);
      default: throw new Error(`Unknown type: ${type}`);
    }
  }
}

const notification = NotificationFactory.create('email', 'Hello!');
notification.send();
```

### Builder

Constructs complex objects step by step, allowing different representations.

```javascript
class QueryBuilder {
  constructor() { this.parts = {}; }
  select(fields) { this.parts.select = fields; return this; }
  from(table) { this.parts.from = table; return this; }
  where(condition) { this.parts.where = condition; return this; }
  limit(n) { this.parts.limit = n; return this; }
  build() {
    let q = `SELECT ${this.parts.select} FROM ${this.parts.from}`;
    if (this.parts.where) q += ` WHERE ${this.parts.where}`;
    if (this.parts.limit) q += ` LIMIT ${this.parts.limit}`;
    return q;
  }
}

const query = new QueryBuilder()
  .select('name, email')
  .from('users')
  .where('active = true')
  .limit(10)
  .build();
```

### Other Creational Patterns

- **Abstract Factory** -- Creates families of related objects without specifying concrete classes.
- **Prototype** -- Creates new objects by cloning an existing instance.

## Structural Patterns

Structural patterns deal with how classes and objects are composed to form larger structures.

### Adapter

Converts the interface of a class into another interface that clients expect.

```python
class OldPrinter:
    def print_text(self, text):
        return f"[OLD] {text}"

class ModernPrinter:
    def render(self, content):
        return f"[MODERN] {content}"

class PrinterAdapter:
    """Adapts ModernPrinter to the OldPrinter interface."""
    def __init__(self, modern_printer):
        self.printer = modern_printer

    def print_text(self, text):
        return self.printer.render(text)

# Client code works with OldPrinter interface
printer = PrinterAdapter(ModernPrinter())
print(printer.print_text("Hello"))  # [MODERN] Hello
```

### Decorator

Adds behavior to objects dynamically without modifying their class.

```python
class LoggingDecorator:
    def __init__(self, service):
        self.service = service

    def process(self, data):
        print(f"Processing: {data}")
        result = self.service.process(data)
        print(f"Result: {result}")
        return result

class CachingDecorator:
    def __init__(self, service):
        self.service = service
        self.cache = {}

    def process(self, data):
        if data not in self.cache:
            self.cache[data] = self.service.process(data)
        return self.cache[data]

# Stack decorators
service = LoggingDecorator(CachingDecorator(RealService()))
```

### Other Structural Patterns

- **Facade** -- Provides a simplified interface to a complex subsystem.
- **Proxy** -- Controls access to another object (lazy loading, access control, logging).
- **Composite** -- Treats individual objects and compositions uniformly (tree structures).
- **Bridge** -- Separates abstraction from implementation so both can vary independently.
- **Flyweight** -- Shares common state between many objects to reduce memory usage.

## Behavioral Patterns

Behavioral patterns define how objects interact and distribute responsibilities.

### Observer

Defines a one-to-many dependency so that when one object changes state, all dependents are notified.

```javascript
class EventEmitter {
  constructor() { this.listeners = new Map(); }

  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(handler);
  }

  emit(event, data) {
    (this.listeners.get(event) || []).forEach(fn => fn(data));
  }
}

const events = new EventEmitter();
events.on('orderPlaced', order => console.log(`New order: ${order.id}`));
events.on('orderPlaced', order => sendConfirmationEmail(order));
events.emit('orderPlaced', { id: 42, total: 99.99 });
```

### Strategy

Defines a family of algorithms and makes them interchangeable at runtime.

```python
class JsonSerializer:
    def serialize(self, data):
        import json
        return json.dumps(data)

class XmlSerializer:
    def serialize(self, data):
        return f"<data>{data}</data>"

class DataExporter:
    def __init__(self, serializer):
        self.serializer = serializer

    def export(self, data):
        return self.serializer.serialize(data)

# Swap strategy at runtime
exporter = DataExporter(JsonSerializer())
print(exporter.export({"name": "Alice"}))

exporter = DataExporter(XmlSerializer())
print(exporter.export({"name": "Alice"}))
```

### Other Behavioral Patterns

- **Command** -- Encapsulates a request as an object (undo/redo, queuing).
- **Iterator** -- Provides sequential access to elements without exposing internal structure.
- **Template Method** -- Defines the skeleton of an algorithm, letting subclasses override specific steps.
- **State** -- Allows an object to change behavior when its internal state changes.
- **Chain of Responsibility** -- Passes a request along a chain of handlers (middleware).
- **Mediator** -- Reduces direct dependencies between objects through a central coordinator.
- **Memento** -- Captures and restores an object's internal state (snapshots).
- **Visitor** -- Adds operations to objects without modifying their classes.

## Patterns in Modern Frameworks

| Pattern | Where You See It |
|---------|-----------------|
| **Observer** | Event emitters in Node.js, React state management, pub/sub systems |
| **Strategy** | Passport.js authentication strategies, sorting algorithms |
| **Decorator** | Python `@decorator`, TypeScript decorators, Express middleware |
| **Factory** | `React.createElement()`, DI containers |
| **Proxy** | JavaScript Proxy object, ORM lazy loading, API gateways |
| **Chain of Responsibility** | Express/Koa middleware, Django middleware |
| **Iterator** | JavaScript iterators/generators, Python iterators |

## When to Use Patterns

- Use a pattern when you recognize the problem it solves.
- Do not force a pattern where a simple function call suffices.
- Patterns are vocabulary for communication, not mandatory templates.
- Prefer simpler solutions and introduce patterns when complexity demands them.

> **Warning:** Do not apply design patterns just because you know them. Over-patterned code is harder to read than code with some duplication.

## Resources

- [Design Patterns: Elements of Reusable Object-Oriented Software (GoF Book)](https://www.oreilly.com/library/view/design-patterns-elements/0201633612/)
- [Refactoring Guru - Design Patterns](https://refactoring.guru/design-patterns)
- [Head First Design Patterns](https://www.oreilly.com/library/view/head-first-design/9781492077992/)
- [Source Making - Design Patterns](https://sourcemaking.com/design_patterns)
- [Patterns of Enterprise Application Architecture - Martin Fowler](https://martinfowler.com/eaaCatalog/)
