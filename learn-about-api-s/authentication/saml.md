# SAML (Security Assertion Markup Language)

SAML is an XML-based open standard for exchanging authentication and authorization data between parties. It is primarily used in enterprise environments to enable Single Sign-On (SSO), allowing users to authenticate once and access multiple applications without logging in again.

## Key Concepts

| Term | Description |
|------|-------------|
| **Identity Provider (IdP)** | The system that authenticates users and issues SAML assertions (e.g., Okta, ADFS, OneLogin) |
| **Service Provider (SP)** | The application that relies on the IdP for authentication |
| **Assertion** | An XML document containing authentication, attribute, or authorization statements |
| **SSO** | Single Sign-On -- authenticate once, access many services |
| **SLO** | Single Logout -- log out from all services at once |
| **Binding** | The transport mechanism (HTTP POST, HTTP Redirect, SOAP) |

## How SAML SSO Works

The most common flow is SP-initiated SSO:

```
1. User attempts to access a protected resource on the SP
2. SP generates a SAML AuthnRequest and redirects user to the IdP
3. User authenticates at the IdP (if not already logged in)
4. IdP generates a SAML Response containing an Assertion
5. IdP sends the Response back to the SP (usually via HTTP POST)
6. SP validates the Assertion and creates a local session
7. User is granted access to the resource
```

```
User            Service Provider (SP)           Identity Provider (IdP)
  |                    |                                |
  |---access app------>|                                |
  |                    |---AuthnRequest (redirect)----->|
  |                    |                                |
  |<---login page--------------------------------------|
  |---credentials------------------------------------->|
  |                    |                                |
  |                    |<---SAML Response (POST)--------|
  |                    |                                |
  |<---access granted--|                                |
```

## SAML Assertion Structure

A SAML assertion is an XML document with three main types of statements:

```xml
<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="_abc123" IssueInstant="2024-01-15T10:30:00Z" Version="2.0">

  <saml:Issuer>https://idp.example.com</saml:Issuer>

  <ds:Signature>...</ds:Signature>

  <!-- Authentication Statement -->
  <saml:AuthnStatement AuthnInstant="2024-01-15T10:30:00Z"
      SessionIndex="_session456">
    <saml:AuthnContext>
      <saml:AuthnContextClassRef>
        urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
      </saml:AuthnContextClassRef>
    </saml:AuthnContext>
  </saml:AuthnStatement>

  <!-- Attribute Statement -->
  <saml:AttributeStatement>
    <saml:Attribute Name="email">
      <saml:AttributeValue>jane@example.com</saml:AttributeValue>
    </saml:Attribute>
    <saml:Attribute Name="role">
      <saml:AttributeValue>admin</saml:AttributeValue>
    </saml:Attribute>
  </saml:AttributeStatement>

  <!-- Conditions (validity constraints) -->
  <saml:Conditions NotBefore="2024-01-15T10:30:00Z"
      NotOnOrAfter="2024-01-15T10:35:00Z">
    <saml:AudienceRestriction>
      <saml:Audience>https://sp.example.com</saml:Audience>
    </saml:AudienceRestriction>
  </saml:Conditions>
</saml:Assertion>
```

## IdP vs SP

| Aspect | Identity Provider (IdP) | Service Provider (SP) |
|--------|------------------------|----------------------|
| Role | Authenticates users | Consumes assertions |
| Examples | Okta, Azure AD, ADFS, OneLogin | Salesforce, Slack, custom apps |
| Manages | User credentials and directory | Application resources |
| Generates | SAML assertions | SAML authentication requests |

## SAML vs OAuth 2.0 / OIDC

| Feature | SAML | OAuth 2.0 / OIDC |
|---------|------|-------------------|
| Format | XML | JSON / JWT |
| Primary use | Enterprise SSO | API authorization + consumer identity |
| Transport | HTTP Redirect, POST | HTTP REST |
| Token type | XML assertion | JSON tokens |
| Complexity | High (XML parsing, signatures) | Medium |
| Mobile support | Poor | Good |
| Adoption | Enterprise / legacy | Modern web and mobile |

## Setting Up SAML (Node.js with passport-saml)

```javascript
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;

passport.use(new SamlStrategy(
  {
    entryPoint: 'https://idp.example.com/sso/saml',
    issuer: 'https://my-app.example.com',
    callbackUrl: 'https://my-app.example.com/auth/saml/callback',
    cert: 'IDP_PUBLIC_CERTIFICATE_HERE'
  },
  (profile, done) => {
    // Find or create user based on SAML attributes
    const user = {
      email: profile.email,
      name: profile.displayName,
      samlId: profile.nameID
    };
    return done(null, user);
  }
));

// Initiate SAML login
app.get('/auth/saml/login', passport.authenticate('saml'));

// Handle SAML response
app.post('/auth/saml/callback',
  passport.authenticate('saml', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);
```

## Metadata Exchange

SAML uses metadata XML documents for configuration exchange between IdP and SP. This eliminates manual configuration of endpoints and certificates.

```xml
<!-- SP Metadata (simplified) -->
<md:EntityDescriptor entityID="https://sp.example.com">
  <md:SPSSODescriptor>
    <md:AssertionConsumerService
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="https://sp.example.com/auth/saml/callback" />
  </md:SPSSODescriptor>
</md:EntityDescriptor>
```

## Security Considerations

- **Always validate XML signatures**: Prevent assertion tampering
- **Check assertion conditions**: Validate `NotBefore`, `NotOnOrAfter`, and `Audience`
- **Prevent XML Signature Wrapping attacks**: Use a well-tested SAML library
- **Use HTTPS for all endpoints**: Protect assertions in transit
- **Validate the `InResponseTo` attribute**: Prevent replay attacks

## When to Use SAML

- Enterprise applications requiring SSO with corporate identity providers
- Integrating with existing SAML-based infrastructure (Active Directory, LDAP)
- Regulatory environments that mandate SAML compliance
- Legacy systems that do not support modern protocols like OIDC

## Resources

- [OASIS SAML 2.0 Specification](http://docs.oasis-open.org/security/saml/v2.0/)
- [OWASP SAML Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html)
- [SAML Technical Overview](https://www.oasis-open.org/committees/download.php/27819/sstc-saml-tech-overview-2.0-cd-02.pdf)
- [passport-saml Documentation](https://github.com/node-saml/passport-saml)
- [Auth0 - SAML](https://auth0.com/docs/authenticate/protocols/saml)
