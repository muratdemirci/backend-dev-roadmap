# CQRS and Event Sourcing

CQRS (Command Query Responsibility Segregation) and Event Sourcing are complementary architectural patterns commonly used together. CQRS separates read and write operations into different models, while Event Sourcing persists state changes as a sequence of events rather than overwriting current state.

## Command Query Responsibility Segregation (CQRS)

CQRS splits the application model into two sides:

- **Command Side (Write)** — Handles create, update, and delete operations. Validates business rules and emits events.
- **Query Side (Read)** — Handles read operations using optimized, denormalized views.

```
         ┌───────────────┐
         │    Client      │
         └──┬──────────┬──┘
            │          │
        Commands    Queries
            │          │
   ┌────────▼──┐  ┌────▼────────┐
   │  Write    │  │   Read      │
   │  Model    │  │   Model     │
   │ (Domain)  │  │ (Projections│
   └────┬──────┘  └──────┬──────┘
        │                │
   ┌────▼──────┐  ┌──────▼──────┐
   │  Event    │  │  Read       │
   │  Store    │  │  Database   │
   └───────────┘  └─────────────┘
```

### Command Example

```javascript
// Command handler
class PlaceOrderHandler {
  async handle(command) {
    const { userId, items, shippingAddress } = command;

    // Validate business rules
    const user = await this.userRepo.findById(userId);
    if (!user.isActive) throw new Error('User account is inactive');

    // Create aggregate and apply domain logic
    const order = Order.create(userId, items, shippingAddress);

    // Persist events
    await this.eventStore.save(order.id, order.uncommittedEvents);

    return order.id;
  }
}
```

### Query Example

```javascript
// Query handler — reads from optimized projection
class GetOrderSummaryHandler {
  async handle(query) {
    return this.readDb.collection('order_summaries').findOne({
      orderId: query.orderId
    });
  }
}
```

## Event Sourcing

Instead of storing the current state, Event Sourcing stores every state change as an immutable event. The current state is derived by replaying events.

### Event Store

The event store is an append-only log of domain events:

```javascript
// Events stored in order
[
  { type: 'OrderCreated', data: { orderId: '1', userId: '42', items: [...] }, timestamp: '...' },
  { type: 'OrderItemAdded', data: { orderId: '1', productId: '99', qty: 2 }, timestamp: '...' },
  { type: 'OrderConfirmed', data: { orderId: '1', confirmedAt: '...' }, timestamp: '...' },
  { type: 'OrderShipped', data: { orderId: '1', trackingNo: 'ABC123' }, timestamp: '...' }
]
```

### Rebuilding State from Events

```javascript
class Order {
  constructor() {
    this.status = 'unknown';
    this.items = [];
  }

  // Replay events to rebuild state
  static fromEvents(events) {
    const order = new Order();
    events.forEach(event => order.apply(event));
    return order;
  }

  apply(event) {
    switch (event.type) {
      case 'OrderCreated':
        this.id = event.data.orderId;
        this.userId = event.data.userId;
        this.status = 'created';
        break;
      case 'OrderConfirmed':
        this.status = 'confirmed';
        break;
      case 'OrderShipped':
        this.status = 'shipped';
        this.trackingNo = event.data.trackingNo;
        break;
    }
  }
}
```

## Projections

Projections transform the event stream into read-optimized views. They subscribe to events and update denormalized data stores.

```javascript
// Projection that builds a read model
class OrderSummaryProjection {
  async handle(event) {
    switch (event.type) {
      case 'OrderCreated':
        await this.readDb.collection('order_summaries').insertOne({
          orderId: event.data.orderId,
          userId: event.data.userId,
          status: 'created',
          itemCount: event.data.items.length
        });
        break;
      case 'OrderShipped':
        await this.readDb.collection('order_summaries').updateOne(
          { orderId: event.data.orderId },
          { $set: { status: 'shipped', trackingNo: event.data.trackingNo } }
        );
        break;
    }
  }
}
```

## Benefits

- **Full audit trail** — Every change is recorded and can be replayed.
- **Temporal queries** — Reconstruct the state of the system at any point in time.
- **Scalability** — Read and write sides can be scaled independently.
- **Flexibility** — New projections can be added and rebuilt from the event log.

## Challenges

- **Eventual consistency** — The read model may lag behind the write model.
- **Event schema evolution** — Changing event structures over time requires migration strategies.
- **Complexity** — Significant learning curve and more moving parts.
- **Snapshotting** — Long event streams need periodic snapshots for performance.

## Resources

- [Martin Fowler — CQRS](https://martinfowler.com/bliki/CQRS.html)
- [Martin Fowler — Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Greg Young — CQRS and Event Sourcing](https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf)
- [Microsoft — CQRS Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [EventStore — Event Sourcing Database](https://www.eventstore.com/)
