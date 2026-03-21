# JSON Web Tokens (JWT)

JSON Web Token (JWT) is an open standard (RFC 7519) for creating compact, self-contained tokens that securely transmit information between parties as a JSON object. JWTs are widely used for stateless authentication in APIs and microservices because the server can validate the token without looking up a session store.

## JWT Structure

A JWT consists of three Base64URL-encoded parts separated by dots:

```
header.payload.signature
```

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJpYXQiOjE2MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## Header

The header declares the token type and the signing algorithm.

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Common algorithms:
- **HS256**: HMAC with SHA-256 (symmetric -- shared secret)
- **RS256**: RSA with SHA-256 (asymmetric -- public/private key pair)
- **ES256**: ECDSA with SHA-256 (asymmetric -- elliptic curve)

## Payload (Claims)

The payload contains claims -- statements about the user and metadata.

```json
{
  "sub": "user-123",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "admin",
  "iat": 1616239022,
  "exp": 1616242622,
  "iss": "https://auth.example.com"
}
```

### Registered Claims

| Claim | Name | Description |
|-------|------|-------------|
| `iss` | Issuer | Who issued the token |
| `sub` | Subject | Who the token identifies |
| `aud` | Audience | Intended recipient |
| `exp` | Expiration | When the token expires (Unix timestamp) |
| `nbf` | Not Before | Token is not valid before this time |
| `iat` | Issued At | When the token was issued |
| `jti` | JWT ID | Unique identifier for the token |

### Custom Claims

You can add any custom claims, but keep the payload small. Avoid storing sensitive data (passwords, credit card numbers) in the payload since it is only encoded, not encrypted.

## Signature

The signature ensures the token has not been tampered with.

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

For asymmetric algorithms (RS256), the token is signed with a private key and verified with the corresponding public key.

## Creating and Verifying JWTs (Node.js)

```javascript
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

// Create a token
function createToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    SECRET,
    { expiresIn: '1h', issuer: 'api.example.com' }
  );
}

// Verify a token
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET, { issuer: 'api.example.com' });
  } catch (err) {
    return null; // Token is invalid or expired
  }
}
```

## JWT Validation Checklist

When receiving a JWT, always validate:

1. **Signature**: Verify using the correct key/secret
2. **Expiration (`exp`)**: Reject expired tokens
3. **Issuer (`iss`)**: Ensure the token was issued by a trusted authority
4. **Audience (`aud`)**: Confirm the token is intended for your service
5. **Not Before (`nbf`)**: Check that the token is already valid
6. **Algorithm**: Explicitly specify expected algorithms to prevent algorithm confusion attacks

## Express.js Middleware Example

```javascript
function jwtAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

app.get('/api/admin', jwtAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json({ message: 'Welcome, admin' });
});
```

## Best Practices

- **Keep tokens short-lived**: Use 5-15 minute expiration for access tokens
- **Use asymmetric algorithms in distributed systems**: RS256 or ES256 let services verify without sharing the signing secret
- **Never store sensitive data in the payload**: JWTs are encoded, not encrypted
- **Always validate the `alg` header**: Prevent algorithm confusion attacks by explicitly setting expected algorithms
- **Do not use `"alg": "none"`**: Reject unsigned tokens in production
- **Use refresh tokens for long sessions**: Pair short-lived JWTs with refresh tokens
- **Consider token size**: JWTs are included in every request; large payloads increase bandwidth usage
- **Implement token revocation**: Use a blocklist or short expiration times

## Common Pitfalls

| Pitfall | Risk |
|---------|------|
| Storing JWTs in localStorage | Vulnerable to XSS attacks |
| Not validating expiration | Tokens remain valid indefinitely |
| Using weak secrets | Tokens can be forged |
| Putting sensitive data in claims | Anyone can decode the payload |
| Accepting any algorithm | Algorithm confusion attacks |

## Resources

- [RFC 7519 - JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519)
- [jwt.io - Debugger and Libraries](https://jwt.io/)
- [Auth0 - Introduction to JWTs](https://auth0.com/docs/secure/tokens/json-web-tokens)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Critical vulnerabilities in JSON Web Token libraries](https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/)
