# OWASP Top 10 Security Risks

The Open Web Application Security Project (OWASP) maintains a regularly updated list of the ten most critical web application security risks. The OWASP Top 10 is the industry standard awareness document for web application security and serves as a starting point for any security program. Understanding these risks is essential for every backend developer.

---

## The OWASP Top 10 (2021 Edition)

| Rank | Risk | Description |
|------|------|-------------|
| A01 | **Broken Access Control** | Users acting outside their intended permissions |
| A02 | **Cryptographic Failures** | Failures related to cryptography leading to data exposure |
| A03 | **Injection** | Hostile data sent to an interpreter as part of a command or query |
| A04 | **Insecure Design** | Missing or ineffective security controls in the design phase |
| A05 | **Security Misconfiguration** | Default configs, open storage, verbose errors, missing headers |
| A06 | **Vulnerable and Outdated Components** | Using components with known vulnerabilities |
| A07 | **Identification and Authentication Failures** | Broken authentication and session management |
| A08 | **Software and Data Integrity Failures** | Code and infrastructure without integrity verification |
| A09 | **Security Logging and Monitoring Failures** | Insufficient logging, detection, and response |
| A10 | **Server-Side Request Forgery (SSRF)** | Application fetches remote resources without validation |

## A01: Broken Access Control

Access control enforces that users cannot act outside their intended permissions. When broken, attackers can access other users' data, modify records, or elevate privileges.

**Common vulnerabilities:**
- Modifying URL parameters to access other users' resources (IDOR)
- Missing authorization checks on API endpoints
- Elevation of privilege (acting as admin without authentication)

```javascript
// Vulnerable: no authorization check
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);  // Any authenticated user can view any other user
});

// Secure: verify ownership
app.get('/api/users/:id', async (req, res) => {
  if (req.params.id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = await User.findById(req.params.id);
  res.json(user);
});
```

## A02: Cryptographic Failures

Previously known as "Sensitive Data Exposure," this covers failures in protecting data with cryptography.

**Prevention checklist:**
- Encrypt data in transit (TLS 1.2+)
- Encrypt sensitive data at rest
- Use strong, current algorithms (AES-256, SHA-256, Argon2)
- Never store passwords as plaintext or with weak hashes (MD5, SHA-1)
- Do not use deprecated protocols (SSL, TLS 1.0/1.1)

## A03: Injection

Injection attacks occur when untrusted data is sent to an interpreter as part of a command or query. SQL injection, NoSQL injection, OS command injection, and LDAP injection are all variants.

```python
# Vulnerable to SQL injection
query = f"SELECT * FROM users WHERE email = '{email}'"

# Secure: parameterized query
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
```

```javascript
// Vulnerable to NoSQL injection
db.users.find({ email: req.body.email, password: req.body.password });

// Secure: validate and sanitize input types
const email = String(req.body.email);
const password = String(req.body.password);
db.users.find({ email, password: hashPassword(password) });
```

## A04: Insecure Design

Insecure design refers to flaws in the architecture and design of the application, not in the implementation. No amount of perfect code can fix a flawed design.

**Examples:**
- No rate limiting on password reset endpoints
- Security questions as the only account recovery method
- No re-authentication for sensitive operations (changing email, password)

**Prevention:** Use threat modeling, secure design patterns, and reference architectures from the start.

## A05: Security Misconfiguration

This includes default configurations, incomplete setups, open cloud storage, misconfigured HTTP headers, and verbose error messages.

```
# Dangerous: detailed error in production
HTTP/1.1 500 Internal Server Error
{
  "error": "PG::ConnectionBad: could not connect to server",
  "stack": "at /app/models/user.rb:42..."
}

# Safe: generic error message
HTTP/1.1 500 Internal Server Error
{
  "error": "An unexpected error occurred. Please try again later."
}
```

**Prevention checklist:**
- Remove default credentials and accounts
- Disable directory listing and debug mode in production
- Set security headers (CSP, X-Frame-Options, HSTS)
- Keep all components updated
- Review cloud storage permissions

## A06: Vulnerable and Outdated Components

Using libraries, frameworks, or other software with known vulnerabilities puts your entire application at risk.

```bash
# Check for vulnerabilities in dependencies
npm audit                    # Node.js
pip-audit                    # Python
mvn dependency-check:check   # Java/Maven
```

**Prevention:**
- Regularly update dependencies
- Subscribe to security advisories for your stack
- Use automated tools like Dependabot, Snyk, or Renovate
- Remove unused dependencies

## A07: Identification and Authentication Failures

Weaknesses in authentication mechanisms that allow attackers to assume other users' identities.

**Common issues:**
- Permitting brute-force attacks (no rate limiting or account lockout)
- Allowing weak passwords
- Insecure session management (predictable session IDs, no expiration)
- Missing multi-factor authentication for sensitive operations

## A08: Software and Data Integrity Failures

This covers failures to verify the integrity of software updates, critical data, and CI/CD pipelines.

**Examples:**
- Using libraries from untrusted CDNs without integrity checks
- Auto-updating without signature verification
- Insecure deserialization of untrusted data

```html
<!-- Use Subresource Integrity (SRI) for external scripts -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8w"
  crossorigin="anonymous">
</script>
```

## A09: Security Logging and Monitoring Failures

Without adequate logging and monitoring, breaches go undetected and unresponded to.

**What to log:**
- Authentication events (successes and failures)
- Authorization failures
- Input validation failures
- Server errors and exceptions
- Administrative actions

```javascript
// Structured security logging
const logger = require('winston');

app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);
  if (!user) {
    logger.warn('Failed login attempt', {
      email: req.body.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  logger.info('Successful login', { userId: user.id, ip: req.ip });
});
```

## A10: Server-Side Request Forgery (SSRF)

SSRF occurs when an application fetches a remote resource based on user-supplied input without proper validation. Attackers can use this to access internal services, cloud metadata APIs, or internal networks.

```python
# Vulnerable: user controls the URL
@app.route('/fetch')
def fetch_url():
    url = request.args.get('url')
    response = requests.get(url)  # Could access http://169.254.169.254/metadata
    return response.text

# Secure: validate and restrict URLs
from urllib.parse import urlparse

ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com']

@app.route('/fetch')
def fetch_url():
    url = request.args.get('url')
    parsed = urlparse(url)
    if parsed.hostname not in ALLOWED_HOSTS:
        return 'Forbidden', 403
    if parsed.scheme not in ('http', 'https'):
        return 'Forbidden', 403
    response = requests.get(url)
    return response.text
```

## Cross-Site Scripting (XSS) and CSRF

While XSS moved from the Top 10 into A03 (Injection) in 2021, it remains one of the most common vulnerabilities:

- **XSS** -- Inject malicious scripts into pages viewed by other users. Prevent with output encoding and CSP.
- **CSRF** -- Trick authenticated users into submitting unintended requests. Prevent with CSRF tokens and SameSite cookies.

## Resources

- [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Application Security Verification Standard (ASVS)](https://owasp.org/www-project-application-security-verification-standard/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [CWE - Common Weakness Enumeration](https://cwe.mitre.org/)
