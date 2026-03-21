# Basic Authentication

Basic Authentication is the simplest HTTP authentication scheme. The client sends the username and password encoded in Base64 with each request via the `Authorization` header. It is defined in RFC 7617 and is supported natively by virtually all HTTP clients and servers.

## How It Works

```
1. Client makes a request to a protected resource
2. Server responds with 401 Unauthorized and a WWW-Authenticate header
3. Client encodes "username:password" in Base64
4. Client resends the request with Authorization: Basic <encoded-string>
5. Server decodes and validates the credentials
6. Server returns the requested resource or 403 Forbidden
```

```http
GET /api/data HTTP/1.1
Host: api.example.com
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

The value `dXNlcm5hbWU6cGFzc3dvcmQ=` is the Base64 encoding of `username:password`.

## Base64 Encoding

Base64 is an encoding scheme, **not encryption**. Anyone who intercepts the header can trivially decode it.

```javascript
// Encoding
const credentials = Buffer.from('username:password').toString('base64');
// Result: "dXNlcm5hbWU6cGFzc3dvcmQ="

// Decoding
const decoded = Buffer.from('dXNlcm5hbWU6cGFzc3dvcmQ=', 'base64').toString();
// Result: "username:password"
```

```bash
# From the command line
echo -n "username:password" | base64
# dXNlcm5hbWU6cGFzc3dvcmQ=

echo "dXNlcm5hbWU6cGFzc3dvcmQ=" | base64 --decode
# username:password
```

## Server-Side Implementation (Express.js)

```javascript
const express = require('express');
const app = express();

function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  // In production, check against a database with hashed passwords
  if (username === 'admin' && password === 'secret') {
    req.user = { username };
    return next();
  }

  res.status(403).json({ error: 'Invalid credentials' });
}

app.get('/api/data', basicAuth, (req, res) => {
  res.json({ message: `Hello, ${req.user.username}` });
});
```

## Using Basic Auth with curl

```bash
# Method 1: Using the -u flag
curl -u username:password https://api.example.com/data

# Method 2: Manual header
curl -H "Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=" https://api.example.com/data
```

## When to Use Basic Auth

Basic Auth is appropriate in limited scenarios:

- **Internal tools and scripts**: Quick integration for trusted environments
- **Server-to-server communication**: Behind a firewall or VPN
- **Development and testing**: Rapid prototyping when security is not the focus
- **Combined with HTTPS**: When the transport layer provides encryption

## Limitations

| Limitation | Explanation |
|-----------|-------------|
| No encryption | Base64 is encoding, not encryption; credentials are sent in plaintext |
| Credentials on every request | Username and password are transmitted with each call |
| No session management | There is no concept of login/logout or session expiry |
| No built-in CSRF protection | Vulnerable if used in browser contexts |
| Hard to revoke | Changing access requires changing the password |
| No MFA support | Only supports single-factor (something you know) |

## Security Considerations

- **Always use HTTPS**: Without TLS, credentials are visible to anyone sniffing the network
- **Never use in browsers for production**: Browsers cache Basic Auth credentials and there is no reliable way to "log out"
- **Use strong passwords**: If you must use Basic Auth, enforce strong password policies
- **Consider alternatives**: For production APIs, prefer token-based auth (JWT, OAuth) or API keys
- **Rate limit requests**: Protect against brute-force attacks on the credentials

## Basic Auth vs API Keys

| Feature | Basic Auth | API Keys |
|---------|-----------|----------|
| Credential type | Username + password | Single key string |
| Revocation | Requires password change | Key can be rotated independently |
| Granularity | Per-user | Can be scoped to specific permissions |
| Standard | RFC 7617 | No formal standard |

## Resources

- [RFC 7617 - The Basic HTTP Authentication Scheme](https://datatracker.ietf.org/doc/html/rfc7617)
- [MDN HTTP Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [HTTP Authentication on Wikipedia](https://en.wikipedia.org/wiki/Basic_access_authentication)
