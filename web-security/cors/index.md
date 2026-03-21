# CORS (Cross-Origin Resource Sharing)

CORS is a browser security mechanism that controls how web pages from one origin can request resources from a different origin. By default, browsers enforce the Same-Origin Policy, which blocks cross-origin HTTP requests made from scripts. CORS relaxes this restriction in a controlled way by using HTTP headers to tell the browser which cross-origin requests are permitted.

---

## What Is an Origin?

An origin is defined by the combination of scheme (protocol), host (domain), and port. Two URLs have the same origin only if all three components match.

```
https://example.com:443/path   -- Origin: https://example.com:443

Same origin:
  https://example.com/other-path          (same scheme, host, port)

Different origin:
  http://example.com/path                 (different scheme)
  https://api.example.com/path            (different host)
  https://example.com:8080/path           (different port)
```

## How CORS Works

When a browser makes a cross-origin request, it adds an `Origin` header. The server responds with `Access-Control-Allow-Origin` and other CORS headers to indicate whether the request is permitted.

### Simple Requests

For simple requests (GET, HEAD, or POST with standard content types), the browser sends the request directly and checks the response headers.

```
Browser --> GET /api/data HTTP/1.1
            Origin: https://myapp.com

Server  <-- HTTP/1.1 200 OK
            Access-Control-Allow-Origin: https://myapp.com
```

### Preflight Requests

For non-simple requests (PUT, DELETE, custom headers, JSON content type), the browser sends a preflight OPTIONS request first to check if the actual request is allowed.

```
Browser --> OPTIONS /api/data HTTP/1.1
            Origin: https://myapp.com
            Access-Control-Request-Method: PUT
            Access-Control-Request-Headers: Content-Type, Authorization

Server  <-- HTTP/1.1 204 No Content
            Access-Control-Allow-Origin: https://myapp.com
            Access-Control-Allow-Methods: GET, POST, PUT, DELETE
            Access-Control-Allow-Headers: Content-Type, Authorization
            Access-Control-Max-Age: 86400

Browser --> PUT /api/data HTTP/1.1       (actual request, only if preflight passes)
            Origin: https://myapp.com
```

## CORS Headers

### Response Headers (Server)

| Header | Description | Example |
|--------|-------------|---------|
| `Access-Control-Allow-Origin` | Which origins are allowed | `https://myapp.com` or `*` |
| `Access-Control-Allow-Methods` | Allowed HTTP methods | `GET, POST, PUT, DELETE` |
| `Access-Control-Allow-Headers` | Allowed request headers | `Content-Type, Authorization` |
| `Access-Control-Allow-Credentials` | Whether cookies/auth are allowed | `true` |
| `Access-Control-Expose-Headers` | Response headers accessible to JS | `X-Request-Id, X-Total-Count` |
| `Access-Control-Max-Age` | Preflight cache duration in seconds | `86400` |

### Request Headers (Browser)

| Header | Description |
|--------|-------------|
| `Origin` | The origin making the request |
| `Access-Control-Request-Method` | Method of the actual request (preflight only) |
| `Access-Control-Request-Headers` | Headers of the actual request (preflight only) |

## Credentials and CORS

By default, cross-origin requests do not include cookies or authentication headers. To send credentials, both the client and server must opt in.

**Client side:**

```javascript
// Fetch API
fetch('https://api.example.com/data', {
  credentials: 'include'  // Send cookies with cross-origin request
});

// Axios
axios.get('https://api.example.com/data', {
  withCredentials: true
});
```

**Server side:**

```
Access-Control-Allow-Origin: https://myapp.com    (must NOT be *)
Access-Control-Allow-Credentials: true
```

> **Important:** When `Access-Control-Allow-Credentials` is `true`, the `Access-Control-Allow-Origin` header must be a specific origin, not the wildcard `*`. This is a strict browser rule.

## Server Implementation

### Express.js

```javascript
const cors = require('cors');

// Simple: allow a specific origin
app.use(cors({
  origin: 'https://myapp.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

// Dynamic: allow multiple origins
const allowedOrigins = ['https://myapp.com', 'https://admin.myapp.com'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Python (Flask)

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://myapp.com"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 86400
    }
})
```

## Common Mistakes

| Mistake | Risk | Fix |
|---------|------|-----|
| `Access-Control-Allow-Origin: *` with credentials | Browser blocks the request | Use a specific origin when credentials are needed |
| Reflecting the `Origin` header blindly | Any site can make authenticated requests | Validate against an allowlist |
| Not handling preflight (OPTIONS) | Non-simple requests fail | Ensure OPTIONS routes return CORS headers |
| Overly permissive `Allow-Methods` | Exposes unintended endpoints | Only allow methods your API actually uses |
| Missing `Vary: Origin` header | Caching issues with multiple origins | Add `Vary: Origin` when origin varies |

## Debugging CORS Issues

```bash
# Test a preflight request with curl
curl -X OPTIONS https://api.example.com/data \
  -H "Origin: https://myapp.com" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Check response headers
curl -I https://api.example.com/data \
  -H "Origin: https://myapp.com"
```

Check the browser's developer console (Network tab) for CORS error messages -- they typically describe exactly which header is missing or misconfigured.

## Resources

- [MDN - Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Fetch Standard - CORS Protocol](https://fetch.spec.whatwg.org/#http-cors-protocol)
- [Express cors middleware](https://www.npmjs.com/package/cors)
- [Flask-CORS](https://flask-cors.readthedocs.io/)
- [Will It CORS? - Interactive Tool](https://httptoolkit.com/will-it-cors/)
