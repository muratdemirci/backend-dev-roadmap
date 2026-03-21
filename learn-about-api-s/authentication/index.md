# Authentication

Authentication is the process of verifying who a user or system is. It is a fundamental building block of any secure backend application. Without proper authentication, your API is open to unauthorized access, data breaches, and abuse.

This section covers the most common authentication mechanisms used in modern backend development, from simple approaches like Basic Auth to complex enterprise solutions like SAML.

## Authentication vs Authorization

These two terms are frequently confused, but they serve very different purposes.

**Authentication (AuthN)** answers the question: _"Who are you?"_
- Verifying identity through credentials (username/password, tokens, certificates)
- Happens before authorization
- Results in an identity context (user ID, roles, claims)

**Authorization (AuthZ)** answers the question: _"What are you allowed to do?"_
- Determining permissions and access levels
- Happens after authentication
- Enforced through policies, roles, or access control lists

```
Client --> [Credentials] --> Authentication --> [Identity] --> Authorization --> [Access Decision]
```

## Why Authentication Matters

- **Data Protection**: Prevents unauthorized users from accessing sensitive information
- **Accountability**: Every action can be traced back to an authenticated identity
- **Compliance**: Regulations like GDPR, HIPAA, and PCI-DSS require proper authentication
- **Trust**: Users and systems need confidence that they are communicating with the right party

## Common Authentication Factors

Authentication can rely on one or more factors:

| Factor | Description | Example |
|--------|-------------|---------|
| Something you know | A secret the user memorizes | Password, PIN |
| Something you have | A physical or digital token | Phone (OTP), hardware key |
| Something you are | Biometric characteristics | Fingerprint, face scan |

Multi-factor authentication (MFA) combines two or more of these factors for stronger security.

## Authentication Methods Overview

| Method | Use Case | Complexity |
|--------|----------|------------|
| Basic Auth | Simple internal services | Low |
| Cookie-Based | Traditional web apps | Medium |
| Token Auth | SPAs, mobile apps | Medium |
| JWT | Stateless APIs, microservices | Medium |
| OAuth 2.0 | Third-party access delegation | High |
| OpenID Connect | Federated identity, SSO | High |
| SAML | Enterprise SSO | High |

## Choosing the Right Method

When selecting an authentication strategy, consider:

1. **Application type**: Is it a server-rendered app, SPA, mobile app, or service-to-service?
2. **Statefulness**: Do you need stateless authentication (tokens) or stateful (sessions)?
3. **Third-party integration**: Do users need to log in with external providers?
4. **Enterprise requirements**: Is SSO or federation with corporate identity providers needed?
5. **Security requirements**: How sensitive is the data being protected?

## Security Best Practices

Regardless of which method you choose, follow these principles:

- **Always use HTTPS**: Never transmit credentials over plain HTTP
- **Hash passwords**: Use bcrypt, scrypt, or argon2 -- never store plaintext passwords
- **Rate limit login attempts**: Prevent brute-force attacks
- **Implement account lockout**: Temporarily lock accounts after repeated failures
- **Use secure token storage**: Avoid localStorage for sensitive tokens; prefer httpOnly cookies
- **Rotate secrets regularly**: API keys, signing keys, and secrets should have expiration policies
- **Log authentication events**: Track logins, failures, and token issuance for auditing

## A Simple Authentication Flow

```
1. Client sends credentials (e.g., username + password)
2. Server validates credentials against stored data
3. Server issues a session or token
4. Client includes session/token in subsequent requests
5. Server verifies session/token on each request
6. Server grants or denies access based on identity
```

## Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [MDN HTTP Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- [Auth0 - Authentication vs Authorization](https://auth0.com/docs/get-started/identity-fundamentals/authentication-and-authorization)
- [NIST Digital Identity Guidelines (SP 800-63)](https://pages.nist.gov/800-63-3/)
- [RFC 7235 - HTTP Authentication](https://datatracker.ietf.org/doc/html/rfc7235)
