# Content Security Policy (CSP)

Content Security Policy is an HTTP response header that allows you to control which resources the browser is permitted to load for a given page. CSP is one of the most effective defenses against Cross-Site Scripting (XSS) attacks because it restricts where scripts, styles, images, and other resources can be loaded from, even if an attacker manages to inject code.

---

## How CSP Works

When a browser receives a CSP header, it enforces the specified rules on the page. Any resource that violates the policy is blocked, and the violation is optionally reported to a specified endpoint.

```
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' 'unsafe-inline'
```

With this policy:
- Scripts can only load from the same origin or `https://cdn.example.com`
- Styles can load from the same origin or be inline
- All other resources (images, fonts, etc.) can only load from the same origin

## CSP Directives

| Directive | Controls | Example |
|-----------|----------|---------|
| `default-src` | Fallback for all resource types | `default-src 'self'` |
| `script-src` | JavaScript sources | `script-src 'self' https://cdn.example.com` |
| `style-src` | CSS sources | `style-src 'self' 'unsafe-inline'` |
| `img-src` | Image sources | `img-src 'self' data: https:` |
| `font-src` | Font file sources | `font-src 'self' https://fonts.gstatic.com` |
| `connect-src` | AJAX, WebSocket, EventSource | `connect-src 'self' https://api.example.com` |
| `frame-src` | iframe sources | `frame-src 'none'` |
| `frame-ancestors` | Who can embed this page in a frame | `frame-ancestors 'none'` |
| `object-src` | Flash, Java plugins | `object-src 'none'` |
| `media-src` | Audio and video sources | `media-src 'self'` |
| `base-uri` | Restricts `<base>` element URLs | `base-uri 'self'` |
| `form-action` | Where forms can submit to | `form-action 'self'` |
| `report-uri` | URL to send violation reports (deprecated) | `report-uri /csp-report` |
| `report-to` | Reporting API endpoint (replaces report-uri) | `report-to csp-endpoint` |

## Source Values

| Value | Meaning |
|-------|---------|
| `'self'` | Same origin (scheme + host + port) |
| `'none'` | Block all resources of this type |
| `'unsafe-inline'` | Allow inline scripts/styles (weakens CSP significantly) |
| `'unsafe-eval'` | Allow `eval()` and similar dynamic code |
| `https:` | Any HTTPS URL |
| `data:` | Data URIs (e.g., `data:image/png;base64,...`) |
| `'nonce-<value>'` | Allow specific inline elements with a matching nonce |
| `'sha256-<hash>'` | Allow inline elements matching a specific hash |

## Using Nonces

A nonce (number used once) is a random value generated per request. Only inline scripts or styles with a matching nonce attribute are executed.

```javascript
// Server-side: generate a nonce per request
const crypto = require('crypto');
const nonce = crypto.randomBytes(16).toString('base64');

// Set the CSP header with the nonce
res.setHeader('Content-Security-Policy',
  `script-src 'self' 'nonce-${nonce}'`
);

// In the HTML template
// <script nonce="<generated-nonce>">
//   console.log('This script runs because the nonce matches');
// </script>
```

```html
<!-- This script runs because the nonce matches the CSP header -->
<script nonce="YWJjZGVmMTIzNDU2">
  console.log('Allowed by CSP nonce');
</script>

<!-- This injected script is blocked because it has no valid nonce -->
<script>
  alert('XSS blocked by CSP');
</script>
```

## Using Hashes

Instead of nonces, you can whitelist specific inline scripts by their SHA hash.

```
Content-Security-Policy: script-src 'self' 'sha256-B2yPHKaXnvFWtRChIbabYmUBFZdVfKKXHbWtWidDVF8='
```

```bash
# Generate the hash for an inline script
echo -n "console.log('hello')" | openssl dgst -sha256 -binary | openssl base64
```

> **Tip:** Nonces are generally preferred over hashes because they are easier to manage in dynamic applications. Hashes work well for static inline scripts that rarely change.

## Preventing XSS with CSP

CSP is a defense-in-depth measure against XSS. Even if an attacker finds an injection point, CSP can prevent the injected script from executing.

```
# Strict CSP policy that blocks most XSS vectors
Content-Security-Policy:
  default-src 'none';
  script-src 'self' 'nonce-{random}';
  style-src 'self';
  img-src 'self';
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none'
```

## Report-Only Mode

Use `Content-Security-Policy-Report-Only` to test a policy without enforcing it. Violations are reported but not blocked.

```
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

```javascript
// Express.js endpoint to receive CSP violation reports
app.post('/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  console.log('CSP Violation:', req.body['csp-report']);
  res.status(204).end();
});
```

## Implementation with Express.js and Helmet

```javascript
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://cdn.example.com"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.example.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"]
  }
}));
```

## CSP Deployment Strategy

1. **Start with Report-Only** -- Deploy a permissive policy in report-only mode to discover what your site loads.
2. **Analyze reports** -- Review violation reports to understand legitimate resource needs.
3. **Tighten the policy** -- Remove unnecessary sources and switch to nonces for inline scripts.
4. **Enforce** -- Move from `Report-Only` to enforcing `Content-Security-Policy`.
5. **Monitor continuously** -- Keep the reporting endpoint active to catch regressions.

## Resources

- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator by Google](https://csp-evaluator.withgoogle.com/)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Helmet.js CSP](https://helmetjs.github.io/docs/csp/)
- [W3C CSP Specification](https://www.w3.org/TR/CSP3/)
