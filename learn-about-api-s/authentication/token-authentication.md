# Token Authentication

Token authentication is a stateless authentication method where the server issues a token after successful login, and the client presents that token in subsequent requests. Unlike session-based authentication, the server does not need to store session state, making token auth well-suited for APIs, SPAs, and mobile applications.

## How It Works

```
1. Client sends credentials (username + password) to the auth endpoint
2. Server validates credentials
3. Server generates and returns an access token (and optionally a refresh token)
4. Client stores the token
5. Client includes the token in the Authorization header on each request
6. Server validates the token and processes the request
```

## Bearer Tokens

The most common way to transmit tokens is via the `Authorization` header using the Bearer scheme, defined in RFC 6750.

```http
GET /api/profile HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

A bearer token means that whoever "bears" (possesses) the token is granted access. There is no additional proof of identity required, which makes secure storage critical.

## Access Tokens

Access tokens are short-lived credentials that grant access to protected resources.

| Property | Typical Value |
|----------|---------------|
| Lifetime | 5 minutes to 1 hour |
| Format | Opaque string or JWT |
| Storage | Memory, httpOnly cookie |
| Revocation | Expires naturally or via blocklist |

```javascript
// Issuing an access token (server-side)
const crypto = require('crypto');

function generateAccessToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  // Store token -> userId mapping in database or cache
  tokenStore.set(token, { userId, expiresAt: Date.now() + 3600000 });
  return token;
}
```

## Refresh Tokens

Refresh tokens are long-lived tokens used to obtain new access tokens without requiring the user to log in again.

| Property | Typical Value |
|----------|---------------|
| Lifetime | Days to weeks |
| Format | Opaque string |
| Storage | httpOnly cookie or secure storage |
| Revocation | Server-side blocklist or database deletion |

```javascript
// Token refresh endpoint
app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  const storedToken = refreshTokenStore.get(refreshToken);
  if (!storedToken || storedToken.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  // Rotate refresh token (invalidate old one, issue new one)
  refreshTokenStore.delete(refreshToken);
  const newRefreshToken = generateRefreshToken(storedToken.userId);
  const newAccessToken = generateAccessToken(storedToken.userId);

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  });
});
```

## Token Storage Strategies

Where you store tokens has significant security implications.

| Storage | XSS Risk | CSRF Risk | Best For |
|---------|----------|-----------|----------|
| `httpOnly` cookie | Low | Needs protection | Web apps (recommended) |
| Memory (JS variable) | Low | None | SPAs (cleared on refresh) |
| `localStorage` | High | None | Not recommended for sensitive tokens |
| `sessionStorage` | Moderate | None | Short-lived tokens only |
| Secure enclave / Keychain | Very low | N/A | Mobile apps |

### Recommended: httpOnly Cookie

```javascript
// Server sets token as httpOnly cookie
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 3600000,
  path: '/'
});
```

### In-Memory Storage for SPAs

```javascript
// Store token in a closure -- not accessible from DevTools or XSS
let accessToken = null;

async function login(username, password) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  accessToken = data.accessToken;
}

function getAuthHeader() {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}
```

## Token Validation Middleware

```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  const tokenData = tokenStore.get(token);
  if (!tokenData || tokenData.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.userId = tokenData.userId;
  next();
}

app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ userId: req.userId });
});
```

## Token Revocation

Unlike sessions, stateless tokens cannot be easily revoked before expiry. Common strategies include:

- **Short-lived access tokens**: Limit exposure window by keeping lifetimes short
- **Token blocklist**: Maintain a list of revoked tokens (checked on each request)
- **Refresh token rotation**: Issue a new refresh token with each use and invalidate the old one
- **Token versioning**: Increment a version counter per user; reject tokens with old versions

## Opaque Tokens vs Structured Tokens

| Type | Description | Server Lookup |
|------|-------------|---------------|
| Opaque | Random string, meaning is stored server-side | Required |
| Structured (JWT) | Self-contained with encoded claims | Not required (but recommended for revocation) |

## Resources

- [RFC 6750 - Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750)
- [OWASP Token-Based Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Auth0 - Token-Based Authentication](https://auth0.com/learn/token-based-authentication-made-easy)
- [MDN Authorization Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)
