# OpenID Connect (OIDC)

OpenID Connect is an identity layer built on top of OAuth 2.0. While OAuth 2.0 handles authorization (what you can access), OpenID Connect adds authentication (who you are). It provides a standardized way for clients to verify user identity and obtain basic profile information.

## How OIDC Relates to OAuth 2.0

```
OAuth 2.0          = Authorization framework (access tokens)
OpenID Connect     = OAuth 2.0 + Identity layer (ID tokens)
```

OIDC adds:
- **ID Tokens**: A JWT containing user identity claims
- **UserInfo Endpoint**: An API to retrieve additional user profile data
- **Discovery**: A standardized way to find provider configuration
- **Standard scopes and claims**: A common vocabulary for user attributes

## Key Concepts

| Term | Description |
|------|-------------|
| **OpenID Provider (OP)** | The identity provider that authenticates the user (e.g., Google, Okta) |
| **Relying Party (RP)** | The client application that relies on the OP for authentication |
| **ID Token** | A JWT containing claims about the authenticated user |
| **UserInfo Endpoint** | An API endpoint that returns claims about the user |
| **Claims** | Key-value pairs describing the user (name, email, etc.) |

## ID Tokens

The ID token is a JWT issued by the OpenID Provider after successful authentication.

```json
{
  "iss": "https://accounts.google.com",
  "sub": "110169484474386276334",
  "aud": "my-client-id",
  "exp": 1616245222,
  "iat": 1616241622,
  "nonce": "abc123",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "email_verified": true,
  "picture": "https://example.com/jane/photo.jpg"
}
```

### Standard Claims

| Claim | Description |
|-------|-------------|
| `sub` | Unique identifier for the user |
| `name` | Full name |
| `email` | Email address |
| `email_verified` | Whether the email has been verified |
| `picture` | URL of the user's profile picture |
| `locale` | User's locale |
| `updated_at` | Time the user's info was last updated |

## OIDC Flows

### Authorization Code Flow (Recommended)

The standard flow for server-side applications. Same as OAuth 2.0 Authorization Code, but includes an ID token in the response.

```
1. RP redirects user to OP with scope=openid
2. User authenticates at the OP
3. OP redirects back with authorization code
4. RP exchanges code for access token + ID token
5. RP validates the ID token
6. (Optional) RP calls UserInfo endpoint for additional claims
```

```javascript
// Token exchange response includes an ID token
const tokenResponse = await fetch('https://op.example.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: 'https://app.example.com/callback',
    client_id: 'my-client-id',
    client_secret: 'my-client-secret'
  })
});

const { access_token, id_token, refresh_token } = await tokenResponse.json();
```

### Implicit Flow (Deprecated)

Returns the ID token directly in the URL fragment. Not recommended due to token exposure in browser history and URLs.

### Hybrid Flow

Combines Authorization Code and Implicit flows. The ID token is returned immediately while the access token is obtained via code exchange.

## Discovery

OIDC providers publish their configuration at a well-known URL, allowing clients to automatically configure themselves.

```
GET https://accounts.google.com/.well-known/openid-configuration
```

```json
{
  "issuer": "https://accounts.google.com",
  "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
  "token_endpoint": "https://oauth2.googleapis.com/token",
  "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
  "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
  "scopes_supported": ["openid", "profile", "email"],
  "response_types_supported": ["code", "id_token", "code id_token"]
}
```

## UserInfo Endpoint

After obtaining an access token, the client can retrieve additional user claims.

```bash
curl -H "Authorization: Bearer <access_token>" \
  https://openidconnect.googleapis.com/v1/userinfo
```

```json
{
  "sub": "110169484474386276334",
  "name": "Jane Doe",
  "given_name": "Jane",
  "family_name": "Doe",
  "picture": "https://example.com/jane/photo.jpg",
  "email": "jane@example.com",
  "email_verified": true
}
```

## OIDC Scopes

| Scope | Claims Returned |
|-------|-----------------|
| `openid` | `sub` (required for OIDC) |
| `profile` | `name`, `family_name`, `given_name`, `picture`, etc. |
| `email` | `email`, `email_verified` |
| `address` | `address` |
| `phone` | `phone_number`, `phone_number_verified` |

## ID Token Validation

Always validate ID tokens before trusting their claims:

1. Verify the JWT signature using the provider's public keys (from `jwks_uri`)
2. Check `iss` matches the expected OpenID Provider
3. Check `aud` contains your client ID
4. Check `exp` has not passed
5. Validate the `nonce` if one was sent in the authorization request

## Resources

- [OpenID Connect Core 1.0 Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [OpenID Connect Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html)
- [jwt.io](https://jwt.io/)
- [Auth0 - OpenID Connect](https://auth0.com/docs/authenticate/protocols/openid-connect-protocol)
- [Google OpenID Connect Documentation](https://developers.google.com/identity/openid-connect/openid-connect)
