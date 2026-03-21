# HATEOAS (Hypermedia as the Engine of Application State)

HATEOAS is a constraint of REST architecture where the server provides hypermedia links in API responses that tell the client what actions are available next. Instead of hardcoding API endpoints in the client, the client discovers available operations dynamically by following links embedded in the responses.

## Core Principle

In a HATEOAS-driven API, the client interacts with the application entirely through hypermedia provided by the server. The only thing a client needs to know upfront is a single entry point URL. Everything else -- available resources, actions, and state transitions -- is discovered at runtime.

```
Without HATEOAS: Client must know all endpoint URLs in advance
With HATEOAS:    Client follows links provided by the server
```

## How It Works

```
1. Client accesses the API entry point
2. Server returns a resource with hypermedia links
3. Client inspects the links to discover available actions
4. Client follows a link to perform an action
5. Server returns a new resource with updated links
6. Repeat -- the client navigates the API like browsing web pages
```

## Example: Order API

A request for an order resource returns not just the data, but links describing what the client can do next.

```json
{
  "id": 1001,
  "status": "pending",
  "total": 59.99,
  "items": [
    { "product": "Widget", "quantity": 3, "price": 19.99 }
  ],
  "_links": {
    "self": { "href": "/api/orders/1001" },
    "cancel": { "href": "/api/orders/1001/cancel", "method": "POST" },
    "pay": { "href": "/api/orders/1001/pay", "method": "POST" },
    "items": { "href": "/api/orders/1001/items" }
  }
}
```

After the order is paid, the response changes:

```json
{
  "id": 1001,
  "status": "paid",
  "total": 59.99,
  "_links": {
    "self": { "href": "/api/orders/1001" },
    "receipt": { "href": "/api/orders/1001/receipt" },
    "shipment": { "href": "/api/orders/1001/shipment" }
  }
}
```

Notice that the `cancel` and `pay` links are gone because those actions are no longer valid. The server controls the workflow by deciding which links to include.

## Discoverability

With HATEOAS, the API entry point serves as the starting point for all interactions.

```bash
GET /api
```

```json
{
  "_links": {
    "self": { "href": "/api" },
    "users": { "href": "/api/users", "title": "User management" },
    "orders": { "href": "/api/orders", "title": "Order management" },
    "products": { "href": "/api/products", "title": "Product catalog" }
  }
}
```

The client does not need to know `/api/users` or `/api/orders` in advance; it discovers them from the entry point.

## HAL (Hypertext Application Language)

HAL is a widely used format for implementing HATEOAS. It defines a standard way to represent links and embedded resources in JSON.

### HAL Structure

```json
{
  "_links": {
    "self": { "href": "/api/users/42" },
    "orders": { "href": "/api/users/42/orders" }
  },
  "id": 42,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "_embedded": {
    "latestOrder": {
      "_links": {
        "self": { "href": "/api/orders/1001" }
      },
      "id": 1001,
      "total": 59.99,
      "status": "shipped"
    }
  }
}
```

### HAL Conventions

| Property | Purpose |
|----------|---------|
| `_links` | Contains link objects with `href` and optional `title`, `type`, `templated` |
| `_embedded` | Contains nested resource objects |
| `self` | A link to the current resource (always present) |

### Link Templates

HAL supports URI templates for parameterized links.

```json
{
  "_links": {
    "self": { "href": "/api/users" },
    "find": { "href": "/api/users/{id}", "templated": true }
  }
}
```

## Implementation Example (Express.js)

```javascript
const express = require('express');
const app = express();

app.get('/api/orders/:id', (req, res) => {
  const order = getOrderById(req.params.id);

  const response = {
    id: order.id,
    status: order.status,
    total: order.total,
    _links: {
      self: { href: `/api/orders/${order.id}` },
      items: { href: `/api/orders/${order.id}/items` }
    }
  };

  // Dynamically add links based on state
  if (order.status === 'pending') {
    response._links.cancel = { href: `/api/orders/${order.id}/cancel`, method: 'POST' };
    response._links.pay = { href: `/api/orders/${order.id}/pay`, method: 'POST' };
  }

  if (order.status === 'paid') {
    response._links.receipt = { href: `/api/orders/${order.id}/receipt` };
  }

  if (order.status === 'shipped') {
    response._links.track = { href: `/api/orders/${order.id}/tracking` };
  }

  res.json(response);
});
```

## Benefits of HATEOAS

- **Loose coupling**: Clients do not hardcode URLs, so the server can change them
- **Discoverability**: New clients can explore the API without documentation
- **State-driven navigation**: The server controls valid transitions
- **Evolvability**: The API can add new features without breaking existing clients

## Challenges

- **Increased response size**: Links add payload overhead
- **Client complexity**: Clients must be built to follow links rather than hardcode paths
- **Low adoption**: Many teams find Level 2 REST sufficient for their needs
- **Lack of tooling**: Fewer client libraries support HATEOAS natively compared to plain REST

## Other Hypermedia Formats

| Format | Description |
|--------|-------------|
| HAL | Simple, widely used JSON hypermedia format |
| JSON-LD | JSON for Linked Data, used in semantic web |
| Siren | Entities, actions, and links for complex workflows |
| Collection+JSON | Read/write hypermedia for managing collections |
| Hydra | Vocabulary for hypermedia-driven APIs (used with JSON-LD) |

## Resources

- [Roy Fielding on HATEOAS](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)
- [HAL Specification](https://stateless.group/hal_specification.html)
- [Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html)
- [Spring HATEOAS Documentation](https://spring.io/projects/spring-hateoas)
- [JSON-LD Specification](https://json-ld.org/)
