# Monolithic Architecture

Monolithic architecture is a traditional software design pattern where an entire application is built as a single, unified unit. All components — user interface, business logic, and data access — are tightly coupled and deployed together as one artifact.

## Structure

A monolithic application typically follows a layered architecture:

- **Presentation Layer** — Handles HTTP requests, renders views or returns API responses.
- **Business Logic Layer** — Contains domain logic, validation, and workflows.
- **Data Access Layer** — Manages database interactions via ORM or raw queries.
- **Database** — A single shared database for the entire application.

```
┌─────────────────────────────┐
│       Presentation          │
├─────────────────────────────┤
│       Business Logic        │
├─────────────────────────────┤
│       Data Access Layer     │
├─────────────────────────────┤
│       Database (Single)     │
└─────────────────────────────┘
```

## Project Layout Example

```
my-app/
├── controllers/
│   ├── userController.js
│   └── orderController.js
├── services/
│   ├── userService.js
│   └── orderService.js
├── models/
│   ├── user.js
│   └── order.js
├── routes/
│   └── index.js
├── app.js
└── package.json
```

## Advantages

- **Simplicity** — Easy to develop, test, and debug in the early stages.
- **Single deployment** — One artifact to build, test, and deploy.
- **Low latency** — In-process function calls instead of network hops.
- **Easy debugging** — A single stack trace covers the entire request flow.
- **Straightforward scaling** — Run multiple instances behind a load balancer.

## Disadvantages

- **Scaling limitations** — You must scale the entire application even if only one module needs it.
- **Tight coupling** — Changes in one module can break others unexpectedly.
- **Long build times** — As the codebase grows, compilation and testing slow down.
- **Technology lock-in** — The entire application must use the same language and framework.
- **Team bottlenecks** — Large teams working on a single codebase face merge conflicts and coordination overhead.

## When to Use Monolithic Architecture

- Small to medium-sized applications with limited scope.
- Early-stage startups where speed of development matters most.
- Teams with fewer than 10 developers working on the same product.
- Applications with simple domain logic and low scalability requirements.
- Proof-of-concept or MVP projects.

## Deployment

Monolithic applications are deployed as a single unit:

```bash
# Build the application
npm run build

# Run the application
node dist/app.js

# Or with Docker
docker build -t my-monolith .
docker run -p 3000:3000 my-monolith
```

A typical Dockerfile for a monolithic Node.js app:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

## Modular Monolith

A modular monolith is a middle ground between a pure monolith and microservices. The application is still deployed as one unit, but the codebase is organized into well-defined, loosely coupled modules with clear boundaries. This approach preserves simplicity while preparing for a potential migration to microservices in the future.

## Resources

- [Martin Fowler — Monolith First](https://martinfowler.com/bliki/MonolithFirst.html)
- [Microsoft — Monolithic Architecture](https://docs.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)
- [Modular Monolith with DDD](https://github.com/kgrzybek/modular-monolith-with-ddd)
- [Sam Newman — Building Microservices (Chapter on Monoliths)](https://samnewman.io/books/building_microservices/)
