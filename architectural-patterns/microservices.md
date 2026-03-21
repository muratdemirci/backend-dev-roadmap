# Microservices Architecture

Microservices architecture is a design approach where an application is composed of small, independently deployable services. Each service owns a specific business capability, runs in its own process, and communicates with other services through well-defined APIs.

## Core Principles

- **Single Responsibility** — Each service handles one bounded context.
- **Independence** — Services are developed, deployed, and scaled independently.
- **Decentralized Data** — Each service manages its own database.
- **Automation** — CI/CD pipelines, infrastructure as code, and automated testing are essential.

## Service Decomposition

Decomposing a monolith into microservices requires identifying proper boundaries:

- **By Business Capability** — Align services to business functions (e.g., Orders, Payments, Inventory).
- **By Subdomain (DDD)** — Use Domain-Driven Design bounded contexts to define service boundaries.
- **Strangler Fig Pattern** — Gradually replace monolith components with new services.

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Users   │  │  Orders  │  │ Payments │
│ Service  │  │ Service  │  │ Service  │
│  [DB]    │  │  [DB]    │  │  [DB]    │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │              │
─────┴─────────────┴──────────────┴──────
              API Gateway
```

## Communication Patterns

### Synchronous Communication

Services call each other directly and wait for a response.

```javascript
// REST call from Orders service to Users service
const response = await fetch('http://users-service:3001/api/users/42');
const user = await response.json();
```

- **REST** — Simple HTTP-based communication using standard verbs.
- **gRPC** — High-performance binary protocol using Protocol Buffers.

### Asynchronous Communication

Services communicate through message brokers without waiting for a response.

```javascript
// Publishing an event to a message broker
channel.publish('exchange', 'order.created', Buffer.from(JSON.stringify({
  orderId: '123',
  userId: '42',
  total: 99.99
})));
```

- **Event-Driven** — Services emit events; others subscribe and react.
- **Message Queues** — Point-to-point messaging via RabbitMQ, Kafka, etc.

## Service Discovery

In dynamic environments, services must find each other at runtime:

- **Client-Side Discovery** — The client queries a service registry (e.g., Eureka, Consul) and selects an instance.
- **Server-Side Discovery** — A load balancer queries the registry on behalf of the client.
- **DNS-Based** — Kubernetes Services provide built-in DNS resolution for pods.

```yaml
# Kubernetes Service for discovery
apiVersion: v1
kind: Service
metadata:
  name: users-service
spec:
  selector:
    app: users
  ports:
    - port: 3001
      targetPort: 3001
```

## Challenges

- **Distributed Complexity** — Network latency, partial failures, and debugging across services.
- **Data Consistency** — Maintaining consistency without distributed transactions requires patterns like Saga.
- **Operational Overhead** — More services mean more deployments, monitoring, and logging.
- **Testing** — Integration and end-to-end testing become significantly harder.
- **Service Mesh** — Tools like Istio or Linkerd help manage inter-service communication, retries, and observability.

## Key Patterns

| Pattern | Purpose |
|---------|---------|
| API Gateway | Single entry point for clients |
| Circuit Breaker | Prevent cascading failures |
| Saga | Manage distributed transactions |
| Sidecar | Attach cross-cutting concerns to services |
| Bulkhead | Isolate failures to individual services |

## Resources

- [Martin Fowler — Microservices](https://martinfowler.com/articles/microservices.html)
- [Sam Newman — Building Microservices](https://samnewman.io/books/building_microservices/)
- [Chris Richardson — Microservices Patterns](https://microservices.io/patterns/)
- [12-Factor App](https://12factor.net/)
- [Microsoft — Microservices Architecture](https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices)
