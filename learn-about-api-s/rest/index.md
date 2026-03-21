# REST (Representational State Transfer)

REST is an architectural style for designing networked applications, introduced by Roy Fielding in his 2000 doctoral dissertation. It leverages the existing HTTP protocol and is the most widely used approach for building web APIs. A RESTful API organizes resources around URLs and uses standard HTTP methods to perform operations.

## REST Constraints

For an API to be considered truly RESTful, it must adhere to six architectural constraints:

| Constraint | Description |
|-----------|-------------|
| **Client-Server** | Separation of concerns between the UI and data storage |
| **Stateless** | Each request contains all information needed; no server-side session |
| **Cacheable** | Responses must define whether they are cacheable |
| **Uniform Interface** | A consistent way to interact with resources |
| **Layered System** | Client cannot tell if it is connected directly to the server |
| **Code on Demand** (optional) | Server can extend client functionality by sending executable code |

## Resource Naming Conventions

Resources are the key abstraction in REST. They are identified by URIs and should follow clear naming conventions.

```
# Good -- nouns, plural, hierarchical
GET    /api/users
GET    /api/users/42
GET    /api/users/42/orders
GET    /api/users/42/orders/7
POST   /api/users
PUT    /api/users/42
DELETE /api/users/42

# Bad -- verbs in URLs, inconsistent naming
GET    /api/getUsers
POST   /api/createUser
GET    /api/user/42/getOrders
```

### Naming Guidelines

- Use **nouns**, not verbs (the HTTP method is the verb)
- Use **plural** resource names (`/users`, not `/user`)
- Use **hyphens** for readability (`/order-items`, not `/orderItems`)
- Use **lowercase** letters
- Nest resources to express relationships (`/users/42/orders`)
- Use query parameters for filtering, sorting, and pagination

## HTTP Methods and Status Codes

```
GET     /resources       - List resources          → 200 OK
GET     /resources/:id   - Get a single resource   → 200 OK / 404 Not Found
POST    /resources       - Create a new resource   → 201 Created
PUT     /resources/:id   - Replace a resource      → 200 OK
PATCH   /resources/:id   - Partially update        → 200 OK
DELETE  /resources/:id   - Remove a resource       → 204 No Content
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK -- request succeeded |
| 201 | Created -- new resource created |
| 204 | No Content -- success with no body |
| 400 | Bad Request -- invalid input |
| 401 | Unauthorized -- authentication required |
| 403 | Forbidden -- insufficient permissions |
| 404 | Not Found -- resource does not exist |
| 409 | Conflict -- resource state conflict |
| 422 | Unprocessable Entity -- validation error |
| 500 | Internal Server Error |

## HATEOAS (Hypermedia as the Engine of Application State)

HATEOAS is a constraint of REST where the server provides hypermedia links in responses, allowing clients to discover available actions dynamically.

```json
{
  "id": 42,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "_links": {
    "self": { "href": "/api/users/42" },
    "orders": { "href": "/api/users/42/orders" },
    "update": { "href": "/api/users/42", "method": "PUT" },
    "delete": { "href": "/api/users/42", "method": "DELETE" }
  }
}
```

## Richardson Maturity Model

Leonard Richardson proposed a model to classify how RESTful an API truly is.

| Level | Description | Example |
|-------|-------------|---------|
| **Level 0** | Single endpoint, RPC-style | `POST /api` with action in body |
| **Level 1** | Individual resources | `GET /api/users/42` |
| **Level 2** | HTTP methods used correctly | `GET` for reads, `POST` for creates |
| **Level 3** | HATEOAS -- hypermedia-driven | Responses include navigational links |

Most production APIs operate at Level 2. Level 3 (true REST) is less common but offers the most discoverability.

## Filtering, Sorting, and Pagination

```
# Filtering
GET /api/users?role=admin&status=active

# Sorting
GET /api/users?sort=name&order=asc

# Pagination (offset-based)
GET /api/users?page=2&limit=20

# Pagination (cursor-based)
GET /api/users?cursor=eyJpZCI6NDJ9&limit=20
```

## Example: Express.js REST API

```javascript
const express = require('express');
const app = express();
app.use(express.json());

let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

app.post('/api/users', (req, res) => {
  const user = { id: users.length + 1, ...req.body };
  users.push(user);
  res.status(201).json(user);
});

app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  users[index] = { id: parseInt(req.params.id), ...req.body };
  res.json(users[index]);
});

app.delete('/api/users/:id', (req, res) => {
  users = users.filter(u => u.id !== parseInt(req.params.id));
  res.status(204).send();
});
```

## Resources

- [Roy Fielding's Dissertation - Chapter 5](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
- [Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html)
- [MDN HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [RESTful API Design Best Practices](https://restfulapi.net/)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
