# HTTPS

HTTPS (HyperText Transfer Protocol Secure) is HTTP encrypted with TLS (Transport Layer Security). It protects data in transit between clients and servers by ensuring confidentiality, integrity, and authenticity. Every production backend service should be served over HTTPS -- it is no longer optional.

---

## How HTTPS Works

HTTPS wraps standard HTTP communication inside a TLS-encrypted tunnel. The process involves three key phases:

1. **TCP Handshake** -- Standard three-way TCP connection is established.
2. **TLS Handshake** -- Client and server negotiate encryption parameters and establish a secure session.
3. **Encrypted Communication** -- All HTTP requests and responses are transmitted through the encrypted tunnel.

```
Client                          Server
  |---- TCP SYN ----------------->|
  |<--- TCP SYN-ACK -------------|
  |---- TCP ACK ----------------->|
  |                                |
  |---- TLS ClientHello ---------->|  (supported ciphers, TLS version)
  |<--- TLS ServerHello ----------|  (chosen cipher, certificate)
  |<--- Certificate --------------|  (server's public key + CA signature)
  |---- Key Exchange ------------->|  (generate shared secret)
  |---- Finished ----------------->|
  |<--- Finished -----------------|
  |                                |
  |==== Encrypted HTTP Traffic ====|
```

## Certificates

A TLS certificate is a digital document that binds a public key to a domain name. It is issued and signed by a Certificate Authority (CA).

**Certificate contents:**

| Field | Description |
|-------|-------------|
| **Subject** | The domain name the certificate is issued to |
| **Issuer** | The CA that signed the certificate |
| **Public Key** | The server's public key for key exchange |
| **Validity Period** | Start and expiration dates |
| **Serial Number** | Unique identifier for the certificate |
| **Signature** | The CA's digital signature proving authenticity |

**Certificate chain of trust:**

```
Root CA (self-signed, pre-installed in browsers/OS)
  └── Intermediate CA (signed by Root CA)
        └── Server Certificate (signed by Intermediate CA)
```

Browsers and operating systems ship with a set of trusted Root CA certificates. When your server presents its certificate, the browser verifies the chain all the way up to a trusted root.

## Certificate Authorities (CA)

A CA is a trusted organization that verifies domain ownership and issues certificates. There are three validation levels:

| Level | Abbreviation | Verification | Use Case |
|-------|-------------|-------------|----------|
| **Domain Validation** | DV | Proves domain control | Blogs, APIs, most websites |
| **Organization Validation** | OV | Verifies organization identity | Business websites |
| **Extended Validation** | EV | Thorough legal entity verification | Banks, financial services |

## Let's Encrypt

Let's Encrypt is a free, automated, and open Certificate Authority that has revolutionized HTTPS adoption. It issues DV certificates and provides tools for automated renewal.

```bash
# Install Certbot (Let's Encrypt client)
sudo apt install certbot python3-certbot-nginx

# Obtain and install a certificate for nginx
sudo certbot --nginx -d example.com -d www.example.com

# Auto-renewal (certbot installs a cron job or systemd timer)
sudo certbot renew --dry-run
```

**Key features of Let's Encrypt:**
- Free DV certificates
- 90-day validity (encourages automation)
- ACME protocol for automated issuance and renewal
- Wildcard certificate support via DNS-01 challenge

## HSTS (HTTP Strict Transport Security)

HSTS tells browsers to always use HTTPS for your domain, even if the user types `http://`. It prevents SSL-stripping attacks where an attacker downgrades the connection to HTTP.

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

| Directive | Description |
|-----------|-------------|
| `max-age` | How long (in seconds) the browser should remember to force HTTPS |
| `includeSubDomains` | Apply HSTS to all subdomains |
| `preload` | Request inclusion in the browser's built-in HSTS preload list |

```javascript
// Express.js with Helmet
const helmet = require('helmet');

app.use(helmet.hsts({
  maxAge: 31536000,          // 1 year
  includeSubDomains: true,
  preload: true
}));
```

> **Warning:** Before enabling `preload`, ensure that HTTPS works correctly on all subdomains. Once your domain is in the preload list, removing it is a slow process.

## Configuring HTTPS in Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # Modern TLS configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

## Common HTTPS Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Mixed content (HTTP resources on HTTPS page) | Browsers block or warn | Use relative URLs or HTTPS for all resources |
| Expired certificates | Connection errors, lost trust | Automate renewal with Certbot |
| Self-signed certificates in production | Browser warnings, no trust | Use a real CA like Let's Encrypt |
| Not redirecting HTTP to HTTPS | Users may connect insecurely | Add 301 redirect and enable HSTS |
| Using outdated TLS versions | Vulnerable to known attacks | Disable TLS 1.0 and 1.1 |

## Testing Your HTTPS Configuration

```bash
# Test with SSL Labs (web)
# https://www.ssllabs.com/ssltest/

# Test with openssl
openssl s_client -connect example.com:443 -tls1_3

# Test with curl
curl -vI https://example.com 2>&1 | grep -E "SSL|TLS|certificate"
```

## Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)
- [HSTS Preload List](https://hstspreload.org/)
- [MDN - HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS)
- [Certbot Documentation](https://certbot.eff.org/)
