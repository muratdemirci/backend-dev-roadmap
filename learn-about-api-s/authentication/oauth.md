# OAuth 2.0

OAuth 2.0 is an authorization framework that allows third-party applications to obtain limited access to a user's resources without exposing their credentials. It is the industry standard for delegated authorization and is used by providers like Google, GitHub, Facebook, and many others.

## Key Roles

| Role | Description |
|------|-------------|
| **Resource Owner** | The user who owns the data |
| **Client** | The application requesting access |
| **Authorization Server** | Issues tokens after authenticating the user |
| **Resource Server** | Hosts the protected resources (API) |

## Grant Types

OAuth 2.0 defines several grant types (flows) for different scenarios.

### Authorization Code Grant

The most secure and widely used flow, designed for server-side applications.

```
1. Client redirects user to Authorization Server
2. User authenticates and grants consent
3. Authorization Server redirects back with an authorization code
4. Client exchanges the code for an access token (server-to-server)
5. Client uses the access token to call the Resource Server
```

```
User-Agent        Client (Backend)        Auth Server        Resource Server
    |                   |                      |                    |
    |---login--------->|                      |                    |
    |<--redirect-------|                      |                    |
    |---authorize------------------------------>|                    |
    |<--code------------------------------------|                    |
    |---code---------->|                      |                    |
    |                   |---code + secret----->|                    |
    |                   |<--access_token-------|                    |
    |                   |---access_token------------------------------>|
    |                   |<--protected resource----|                    |
```

### Implicit Grant (Deprecated)

Previously used for SPAs where tokens were returned directly in the URL fragment. This flow is now considered insecure and has been replaced by Authorization Code with PKCE.

### Client Credentials Grant

Used for machine-to-machine communication where no user is involved.

```bash
curl -X POST https://auth.example.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=my-service" \
  -d "client_secret=secret123" \
  -d "scope=read:data"
```

Response:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read:data"
}
```

### Resource Owner Password Credentials (Deprecated)

The user provides their username and password directly to the client. Only appropriate for highly trusted first-party clients. This grant type is deprecated in the OAuth 2.1 draft.

## PKCE (Proof Key for Code Exchange)

PKCE adds a layer of security to the Authorization Code flow and is now recommended for all clients, including public clients like SPAs and mobile apps.

```
1. Client generates a random code_verifier
2. Client computes code_challenge = SHA256(code_verifier)
3. Client sends code_challenge with the authorization request
4. After receiving the auth code, client sends code_verifier with the token request
5. Authorization Server verifies SHA256(code_verifier) == code_challenge
```

```javascript
const crypto = require('crypto');

// Generate code verifier
const codeVerifier = crypto.randomBytes(32).toString('base64url');

// Generate code challenge
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// Include in authorization request:
// GET /authorize?response_type=code
//   &client_id=my-app
//   &redirect_uri=https://app.example.com/callback
//   &code_challenge=<codeChallenge>
//   &code_challenge_method=S256
//   &scope=openid profile
```

## Access Tokens and Refresh Tokens

- **Access Token**: Short-lived token used to access protected resources. Typically valid for minutes to hours.
- **Refresh Token**: Long-lived token used to obtain new access tokens without re-authenticating the user.

```javascript
// Refreshing an access token
const response = await fetch('https://auth.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: storedRefreshToken,
    client_id: 'my-app',
    client_secret: 'secret123'
  })
});
```

## Scopes

Scopes define the level of access that the client is requesting.

```
GET /authorize?scope=read:user write:repos
```

The authorization server presents these scopes to the user for consent, and the resulting token is limited to the approved scopes.

## Security Considerations

- Always use HTTPS for all OAuth endpoints
- Use PKCE for all public clients (SPAs, mobile apps)
- Store tokens securely; never expose them in URLs or logs
- Validate the `state` parameter to prevent CSRF attacks
- Keep access token lifetimes short
- Implement token revocation for logout flows

## Resources

- [RFC 6749 - The OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749)
- [RFC 7636 - Proof Key for Code Exchange (PKCE)](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth 2.1 Draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-07)
- [OAuth.net](https://oauth.net/2/)
- [Auth0 - OAuth 2.0 Documentation](https://auth0.com/docs/authenticate/protocols/oauth)
