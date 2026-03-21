# Cookie-Based Authentication

Cookie-based authentication is the traditional method for managing user sessions in web applications. After a user logs in, the server creates a session and sends a session identifier back to the browser as a cookie. The browser automatically includes this cookie in every subsequent request.

## How It Works

```
1. User submits login form (username + password)
2. Server validates credentials
3. Server creates a session (stored in memory, database, or cache)
4. Server responds with a Set-Cookie header containing the session ID
5. Browser stores the cookie and sends it with every request to that domain
6. Server looks up the session ID to identify the user
7. On logout, server destroys the session and clears the cookie
```

## Session Cookies

A session cookie is a cookie that holds a reference to a server-side session. It does not contain user data itself -- only an opaque identifier.

```http
HTTP/1.1 200 OK
Set-Cookie: sessionId=abc123def456; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
```

### Key Cookie Attributes

| Attribute | Purpose |
|-----------|---------|
| `HttpOnly` | Prevents JavaScript from accessing the cookie (mitigates XSS) |
| `Secure` | Cookie is only sent over HTTPS connections |
| `SameSite` | Controls when cookies are sent with cross-site requests |
| `Path` | Limits the cookie to a specific URL path |
| `Domain` | Specifies which domain can receive the cookie |
| `Max-Age` / `Expires` | Sets cookie lifetime; omitting makes it a session cookie |

## Server-Side Example (Express.js)

```javascript
const express = require('express');
const session = require('express-session');

const app = express();

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  }
}));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = authenticateUser(username, password);
  if (user) {
    req.session.userId = user.id;
    res.json({ message: 'Logged in' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ userId: req.session.userId });
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.json({ message: 'Logged out' });
});
```

## CSRF Protection

Cross-Site Request Forgery (CSRF) is the primary vulnerability with cookie-based auth. Because browsers automatically attach cookies, a malicious site can forge requests on behalf of an authenticated user.

### Mitigation Strategies

1. **CSRF Tokens**: Generate a unique token per session, include it in forms, and validate it server-side.

```html
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="random-csrf-token-here" />
  <button type="submit">Submit</button>
</form>
```

2. **SameSite Cookie Attribute**: Setting `SameSite=Strict` or `SameSite=Lax` prevents the browser from sending cookies on cross-origin requests.

3. **Double Submit Cookie**: Send the CSRF token both as a cookie and in the request body; the server verifies they match.

## SameSite Attribute in Detail

| Value | Behavior |
|-------|----------|
| `Strict` | Cookie never sent on cross-site requests |
| `Lax` | Cookie sent on top-level navigations (GET only) |
| `None` | Cookie always sent (requires `Secure` flag) |

## Advantages and Disadvantages

**Advantages:**
- Browser handles cookie management automatically
- Easy to implement with mature libraries
- Session can be revoked instantly on the server

**Disadvantages:**
- Requires server-side session storage (state management)
- Vulnerable to CSRF if not properly protected
- Scaling requires shared session stores (Redis, database)
- Not ideal for mobile or non-browser clients

## Session Storage Options

| Storage | Pros | Cons |
|---------|------|------|
| In-memory | Fast, simple | Lost on restart, not scalable |
| Database | Persistent, shared | Slower, adds DB load |
| Redis / Memcached | Fast, shared, TTL support | Additional infrastructure |

## Resources

- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [RFC 6265 - HTTP State Management Mechanism](https://datatracker.ietf.org/doc/html/rfc6265)
- [express-session Documentation](https://github.com/expressjs/session)
