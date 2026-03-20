# Learn about APIs

APIs (Application Programming Interfaces) are the backbone of modern software architecture. They define how software components communicate with each other, enabling everything from mobile apps fetching data to microservices coordinating complex business processes. As a backend developer, designing and building APIs is one of your core responsibilities.

# Contents

1. [What is an API](#what-is-an-api)
2. [Types of APIs](#types-of-apis)
3. [REST API In Depth](#rest-api-in-depth)
4. [HTTP Methods](#http-methods)
5. [HTTP Status Codes](#http-status-codes)
6. [Headers and Content Negotiation](#headers-and-content-negotiation)
7. [Request and Response Formats](#request-and-response-formats)
8. [RESTful Design Principles](#restful-design-principles)
9. [Authentication and Authorization](#authentication-and-authorization)
10. [API Versioning](#api-versioning)
11. [Rate Limiting](#rate-limiting)
12. [CORS (Cross-Origin Resource Sharing)](#cors-cross-origin-resource-sharing)
13. [OpenAPI and Swagger Documentation](#openapi-and-swagger-documentation)
14. [API Testing Tools](#api-testing-tools)
15. [Best Practices for API Design](#best-practices-for-api-design)
16. [Resources](#resources)

---

## What is an API

An **API (Application Programming Interface)** is a contract that defines how two pieces of software communicate. It specifies what requests can be made, what data format to use, and what responses to expect.

APIs exist at every level of software:

- **Library APIs** -- functions and classes you call in code (e.g., `fs.readFile()` in Node.js)
- **Operating System APIs** -- system calls for file I/O, networking, process management
- **Web APIs** -- HTTP-based interfaces for communicating between services over a network

In backend development, "API" most commonly refers to **web APIs** -- HTTP endpoints that clients (browsers, mobile apps, other servers) use to interact with your application.

```
Client (Browser/App)  <──── HTTP Request ────>  Backend API  <──>  Database
                      <──── HTTP Response ───>
```

## Types of APIs

### REST (Representational State Transfer)

The most common API style for web services. Uses HTTP methods and URLs to represent resources.

```
GET /api/users/42    -->  Fetch user with ID 42
POST /api/users      -->  Create a new user
```

### SOAP (Simple Object Access Protocol)

An XML-based protocol with strict standards. Common in enterprise and legacy systems.

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetUser>
      <UserId>42</UserId>
    </GetUser>
  </soap:Body>
</soap:Envelope>
```

### GraphQL

A query language for APIs developed by Facebook. Clients specify exactly what data they need.

```graphql
query {
  user(id: 42) {
    name
    email
    posts {
      title
      createdAt
    }
  }
}
```

### gRPC (Google Remote Procedure Call)

A high-performance RPC framework using Protocol Buffers for serialization. Excellent for service-to-service communication.

```protobuf
service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc CreateUser(CreateUserRequest) returns (User);
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}
```

### WebSocket

A protocol for full-duplex, real-time communication over a single TCP connection.

```javascript
const ws = new WebSocket('ws://localhost:8080/chat');
ws.onmessage = (event) => console.log(event.data);
ws.send('Hello server!');
```

### Comparison

| Feature | REST | GraphQL | gRPC | SOAP | WebSocket |
|---|---|---|---|---|---|
| Protocol | HTTP | HTTP | HTTP/2 | HTTP/SMTP | TCP |
| Data format | JSON/XML | JSON | Protobuf (binary) | XML | Any |
| Real-time | No (polling) | Subscriptions | Streaming | No | Yes |
| Use case | General APIs | Flexible queries | Microservices | Enterprise | Real-time apps |
| Learning curve | Low | Moderate | Moderate | High | Low |
| Browser support | Native | Native | Via proxy | Native | Native |

### REST API Request/Response Flow

```mermaid
sequenceDiagram
    participant Client as Client (Browser/App)
    participant API as REST API Server
    participant DB as Database

    Client->>API: HTTP Request (GET /api/users/42)
    Note right of Client: Headers: Authorization, Accept
    API->>API: Authenticate & Validate Request
    API->>DB: Query (SELECT * FROM users WHERE id=42)
    DB-->>API: Result Row
    API->>API: Serialize to JSON
    API-->>Client: HTTP Response (200 OK)
    Note left of API: Headers: Content-Type, Cache-Control
    Note left of API: Body: {"id":42, "name":"Alice"}
```

## REST API In Depth

REST (Representational State Transfer) is an architectural style defined by Roy Fielding in his 2000 doctoral dissertation. It is not a protocol or standard -- it is a set of constraints that, when followed, produce scalable and maintainable web services.

### Core Constraints

1. **Client-Server** -- separation of concerns between the client (UI) and server (data/logic)
2. **Stateless** -- each request contains all the information needed to process it; the server stores no session state
3. **Cacheable** -- responses must define whether they can be cached
4. **Uniform Interface** -- consistent URL structure, resource representation, and HTTP method usage
5. **Layered System** -- clients cannot tell if they are connected to the end server or an intermediary
6. **Code on Demand (optional)** -- servers can send executable code to clients

## HTTP Methods

HTTP methods (also called verbs) indicate the desired action on a resource.

| Method | Purpose | Idempotent | Safe | Request Body |
|---|---|---|---|---|
| `GET` | Retrieve a resource | Yes | Yes | No |
| `POST` | Create a new resource | No | No | Yes |
| `PUT` | Replace a resource entirely | Yes | No | Yes |
| `PATCH` | Partially update a resource | No* | No | Yes |
| `DELETE` | Remove a resource | Yes | No | Optional |
| `HEAD` | Same as GET but no body | Yes | Yes | No |
| `OPTIONS` | Describe communication options | Yes | Yes | No |

- **Safe** means the method does not modify server state
- **Idempotent** means making the same request multiple times produces the same result
- *PATCH can be idempotent depending on implementation

```bash
# GET - Retrieve all users
curl -X GET http://localhost:3000/api/users

# POST - Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# PUT - Replace a user
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Smith", "email": "alice.smith@example.com"}'

# PATCH - Partially update a user
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"email": "newemail@example.com"}'

# DELETE - Remove a user
curl -X DELETE http://localhost:3000/api/users/1
```

## HTTP Status Codes

Status codes communicate the result of an API request.

### 2xx -- Success

| Code | Name | Usage |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH, or DELETE |
| 201 | Created | Successful POST that creates a resource |
| 204 | No Content | Successful request with no response body (e.g., DELETE) |

### 3xx -- Redirection

| Code | Name | Usage |
|---|---|---|
| 301 | Moved Permanently | Resource has a new permanent URL |
| 304 | Not Modified | Cached version is still valid |

### 4xx -- Client Errors

| Code | Name | Usage |
|---|---|---|
| 400 | Bad Request | Invalid request syntax or parameters |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource does not exist |
| 405 | Method Not Allowed | HTTP method not supported on this endpoint |
| 409 | Conflict | Request conflicts with current state (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |

### 5xx -- Server Errors

| Code | Name | Usage |
|---|---|---|
| 500 | Internal Server Error | Unexpected server failure |
| 502 | Bad Gateway | Upstream server returned invalid response |
| 503 | Service Unavailable | Server is temporarily overloaded or down |
| 504 | Gateway Timeout | Upstream server did not respond in time |

> **Tip:** Always return appropriate status codes. A `200 OK` with `{"error": "not found"}` in the body is misleading and breaks client expectations.

## Headers and Content Negotiation

HTTP headers provide metadata about the request or response.

### Common Request Headers

```
Content-Type: application/json          # Format of the request body
Accept: application/json                # Desired response format
Authorization: Bearer eyJhbGciOi...     # Authentication token
User-Agent: MyApp/1.0                   # Client identification
Cache-Control: no-cache                 # Caching behavior
X-Request-ID: abc-123-def              # Correlation ID for tracing
```

### Common Response Headers

```
Content-Type: application/json          # Format of the response body
Content-Length: 1234                     # Size of the response
Cache-Control: max-age=3600             # Cacheable for 1 hour
X-RateLimit-Limit: 100                  # Rate limit max
X-RateLimit-Remaining: 87              # Remaining requests
X-RateLimit-Reset: 1640000000          # When the limit resets
```

## Request and Response Formats

### JSON (JavaScript Object Notation)

The dominant data format for modern APIs. Lightweight, human-readable, and natively supported by JavaScript.

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "roles": ["admin", "editor"],
  "profile": {
    "bio": "Backend developer",
    "avatar_url": "https://example.com/alice.jpg"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

### XML (eXtensible Markup Language)

More verbose, commonly used in SOAP APIs and legacy systems.

```xml
<user>
  <id>1</id>
  <name>Alice</name>
  <email>alice@example.com</email>
  <roles>
    <role>admin</role>
    <role>editor</role>
  </roles>
</user>
```

### Standard Response Envelope

A consistent response structure improves client-side handling:

```json
{
  "data": {
    "id": 1,
    "name": "Alice"
  },
  "meta": {
    "request_id": "abc-123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

For errors:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "must be a valid email address"
      }
    ]
  }
}
```

### Pagination

For endpoints returning collections, always paginate:

```json
{
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

Common pagination styles:

| Style | Parameters | Pros | Cons |
|---|---|---|---|
| Offset | `?page=2&per_page=20` | Simple, familiar | Slow for large offsets |
| Cursor | `?cursor=abc123&limit=20` | Consistent, performant | Cannot jump to a page |
| Keyset | `?after_id=100&limit=20` | Very performant | Requires sortable field |

## RESTful Design Principles

### URL Design

Use nouns (resources), not verbs (actions):

```
# Good
GET    /api/users          # List users
GET    /api/users/42       # Get user 42
POST   /api/users          # Create a user
PUT    /api/users/42       # Update user 42
DELETE /api/users/42       # Delete user 42

# Bad
GET    /api/getUsers
POST   /api/createUser
POST   /api/deleteUser/42
```

### Nested Resources

Express relationships through URL structure:

```
GET /api/users/42/posts         # Get all posts by user 42
GET /api/users/42/posts/7       # Get post 7 by user 42
POST /api/users/42/posts        # Create a post for user 42
```

### Filtering, Sorting, and Searching

Use query parameters:

```
GET /api/users?role=admin&status=active       # Filter
GET /api/users?sort=created_at&order=desc     # Sort
GET /api/users?q=alice                        # Search
GET /api/users?fields=id,name,email           # Field selection
```

## Authentication and Authorization

### API Keys

Simple token included in the request header or query parameter.

```bash
curl -H "X-API-Key: your-api-key-here" https://api.example.com/data
```

- Simple to implement
- No user context -- identifies the application, not the user
- Must be kept secret

### Basic Authentication

Username and password encoded in Base64. Must be used over HTTPS.

```bash
curl -u username:password https://api.example.com/data
# Sends header: Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

### JWT (JSON Web Token)

A self-contained token that encodes user identity and claims. Widely used for stateless authentication.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIn0.
signature
```

A JWT has three parts: **Header**, **Payload**, **Signature**.

```json
// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload
{
  "sub": "1234567890",
  "name": "Alice",
  "role": "admin",
  "exp": 1640000000
}
```

### OAuth 2.0

An authorization framework that allows third-party applications to access user resources without exposing credentials.

```
User -> Client App -> Authorization Server -> Resource Server
  1. User clicks "Login with GitHub"
  2. Client redirects to GitHub's authorization page
  3. User authorizes the app
  4. GitHub redirects back with an authorization code
  5. Client exchanges the code for an access token
  6. Client uses the token to access the API
```

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant App as Client App
    participant Auth as Authorization Server<br/>(e.g. GitHub)
    participant API as Resource Server<br/>(API)

    User->>App: 1. Click "Login with GitHub"
    App->>Auth: 2. Redirect to authorization page
    Auth->>User: 3. Show consent screen
    User->>Auth: 4. Approve access
    Auth->>App: 5. Redirect with authorization code
    App->>Auth: 6. Exchange code for access token
    Auth-->>App: 7. Return access token
    App->>API: 8. API request with access token
    API-->>App: 9. Protected resource data
```

Common OAuth 2.0 grant types:

| Grant Type | Use Case |
|---|---|
| Authorization Code | Web apps with a server backend |
| Authorization Code + PKCE | Single-page apps, mobile apps |
| Client Credentials | Machine-to-machine communication |
| Refresh Token | Obtaining new access tokens without re-authentication |

> **Tip:** Never store JWTs in localStorage for web applications -- use httpOnly cookies instead. localStorage is vulnerable to XSS attacks.

## API Versioning

As APIs evolve, breaking changes may be necessary. Versioning allows old clients to continue working while new clients use updated endpoints.

### Strategies

| Strategy | Example | Pros | Cons |
|---|---|---|---|
| URL path | `/api/v1/users` | Explicit, easy to understand | URL changes |
| Query parameter | `/api/users?version=1` | Optional | Easy to miss |
| Header | `Accept: application/vnd.api.v1+json` | Clean URLs | Less discoverable |
| Content negotiation | `Accept: application/json; version=1` | Follows HTTP semantics | More complex |

The **URL path** approach is the most widely used because of its simplicity:

```
/api/v1/users    # Version 1
/api/v2/users    # Version 2 with breaking changes
```

## Rate Limiting

Rate limiting protects your API from abuse and ensures fair usage.

### Common Algorithms

| Algorithm | Description |
|---|---|
| Fixed Window | Count requests in fixed time intervals (e.g., 100/minute) |
| Sliding Window | Rolling window based on each request's timestamp |
| Token Bucket | Tokens are added at a fixed rate; each request consumes a token |
| Leaky Bucket | Requests are processed at a fixed rate; excess is queued or dropped |

### Implementation

Return rate limit information in response headers:

```
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000060

HTTP/1.1 429 Too Many Requests
Retry-After: 30
```

```javascript
// Express.js rate limiting with express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,                   // 100 requests per window
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);
```

## CORS (Cross-Origin Resource Sharing)

**CORS** is a browser security mechanism that restricts web pages from making requests to a different origin (domain, protocol, or port) than the one serving the page.

### How It Works

1. The browser sends a **preflight request** (OPTIONS) to check if the cross-origin request is allowed
2. The server responds with CORS headers indicating what is permitted
3. If allowed, the browser sends the actual request

### CORS Headers

```
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
Access-Control-Allow-Credentials: true
```

```javascript
// Express.js CORS configuration
const cors = require('cors');

app.use(cors({
    origin: ['https://myapp.com', 'https://staging.myapp.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
```

> **Tip:** Never use `Access-Control-Allow-Origin: *` in production APIs that handle authentication. It allows any website to make requests to your API.

## OpenAPI and Swagger Documentation

The **OpenAPI Specification** (formerly Swagger) is a standard for describing REST APIs. It enables automatic documentation generation, client SDK generation, and API testing.

### Example OpenAPI Definition

```yaml
openapi: 3.0.3
info:
  title: User API
  version: 1.0.0
  description: API for managing users

paths:
  /api/users:
    get:
      summary: List all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: A list of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'

    post:
      summary: Create a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'
      responses:
        '201':
          description: User created

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
          format: email

    CreateUser:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
        email:
          type: string
          format: email
```

Tools that work with OpenAPI:

- **Swagger UI** -- interactive API documentation in the browser
- **Swagger Editor** -- write and validate OpenAPI specs
- **Redoc** -- beautiful API documentation
- **OpenAPI Generator** -- generate client SDKs in many languages

## API Testing Tools

### curl

The command-line tool for making HTTP requests. Available on every major OS.

```bash
# GET request
curl https://api.example.com/users

# POST with JSON body
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token123" \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# Verbose output (see headers)
curl -v https://api.example.com/users

# Save response to file
curl -o response.json https://api.example.com/users
```

### Postman

A popular GUI application for building, testing, and documenting APIs. Features include:

- Collections to organize related requests
- Environment variables for different stages (dev, staging, production)
- Automated test scripts in JavaScript
- Mock servers
- API documentation generation

### Insomnia

A lightweight alternative to Postman with a cleaner interface. Supports REST, GraphQL, and gRPC.

### HTTPie

A user-friendly command-line HTTP client with intuitive syntax:

```bash
# GET request
http GET api.example.com/users

# POST with JSON (default)
http POST api.example.com/users name=Alice email=alice@example.com

# Custom headers
http GET api.example.com/users Authorization:"Bearer token123"
```

### API Gateway Pattern

```mermaid
graph LR
    A["Mobile App"] --> GW["API Gateway"]
    B["Web App"] --> GW
    C["3rd Party"] --> GW

    GW -->|"/api/users"| D["User Service"]
    GW -->|"/api/orders"| E["Order Service"]
    GW -->|"/api/payments"| F["Payment Service"]

    GW -.-|"Cross-cutting concerns"| G["Auth, Rate Limiting,<br/>Logging, CORS,<br/>Load Balancing"]
```

## Best Practices for API Design

1. **Use consistent naming conventions** -- stick to one style (snake_case or camelCase) for all field names

2. **Always return proper status codes** -- use 201 for creation, 204 for deletion, 404 for not found

3. **Validate input data** -- never trust client input; validate and sanitize everything

4. **Use pagination for collections** -- never return unbounded lists

5. **Provide meaningful error messages** -- include error codes, human-readable messages, and field-level details

6. **Version your API from day one** -- adding versioning later is painful

7. **Use HTTPS everywhere** -- never serve APIs over plain HTTP

8. **Document your API** -- use OpenAPI/Swagger for machine-readable documentation

9. **Design for idempotency** -- clients should be able to safely retry requests

10. **Use proper HTTP methods** -- GET for reading, POST for creating, PUT/PATCH for updating, DELETE for removing

11. **Include request IDs** -- generate a unique ID for each request and return it in the response for debugging

12. **Log everything** -- log requests, responses, errors, and performance metrics

13. **Design for backward compatibility** -- adding fields is safe; removing or renaming fields is a breaking change

14. **Use standard date formats** -- always use ISO 8601 (`2024-01-15T10:30:00Z`)

> **Tip:** When designing an API, write example requests and responses before writing any code. This "API-first" approach helps you think through the interface from the client's perspective.

## Resources

- [RESTful API Design -- Best Practices](https://restfulapi.net/)
- [HTTP Status Codes Reference](https://httpstatuses.com/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Swagger Editor (online)](https://editor.swagger.io/)
- [Roy Fielding's Dissertation (REST origin)](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm)
- [GraphQL Official Documentation](https://graphql.org/learn/)
- [gRPC Documentation](https://grpc.io/docs/)
- [OAuth 2.0 Simplified](https://www.oauth.com/)
- [JWT.io -- JSON Web Token debugger](https://jwt.io/)
- [Postman Learning Center](https://learning.postman.com/)
- [Mozilla Developer Network -- HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [API Design Patterns (book by JJ Geewax)](https://www.manning.com/books/api-design-patterns)
