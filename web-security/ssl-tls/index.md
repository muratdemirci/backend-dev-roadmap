# SSL/TLS

SSL (Secure Sockets Layer) and TLS (Transport Layer Security) are cryptographic protocols that provide secure communication over a network. TLS is the successor to SSL -- all SSL versions are deprecated and insecure. When people say "SSL" today, they almost always mean TLS. Understanding TLS is essential for any backend developer because it underpins HTTPS, secure email, VPNs, and virtually all encrypted internet communication.

---

## SSL vs TLS History

| Protocol | Year | Status |
|----------|------|--------|
| SSL 1.0 | Never released | Severe flaws found before release |
| SSL 2.0 | 1995 | Deprecated (insecure) |
| SSL 3.0 | 1996 | Deprecated (POODLE attack, 2014) |
| TLS 1.0 | 1999 | Deprecated (BEAST attack) |
| TLS 1.1 | 2006 | Deprecated |
| TLS 1.2 | 2008 | Secure (widely deployed) |
| TLS 1.3 | 2018 | Secure (current standard) |

> **Rule:** Only use TLS 1.2 and TLS 1.3 in production. Disable all older versions.

## The TLS Handshake

The TLS handshake establishes a secure connection between client and server. It authenticates the server (and optionally the client), negotiates encryption parameters, and derives shared session keys.

### TLS 1.2 Handshake

```
Client                                Server
  |                                      |
  |--- ClientHello ------------------->  |  (TLS version, cipher suites, random)
  |                                      |
  |<-- ServerHello --------------------  |  (chosen cipher, random)
  |<-- Certificate --------------------  |  (server's X.509 certificate)
  |<-- ServerKeyExchange --------------  |  (DH parameters, if needed)
  |<-- ServerHelloDone ----------------  |
  |                                      |
  |--- ClientKeyExchange ------------->  |  (premaster secret, encrypted)
  |--- ChangeCipherSpec -------------->  |  (switching to encrypted mode)
  |--- Finished (encrypted) ---------->  |
  |                                      |
  |<-- ChangeCipherSpec ---------------  |
  |<-- Finished (encrypted) ----------  |
  |                                      |
  |==== Application Data (encrypted) ==  |
```

The TLS 1.2 handshake requires **2 round trips** before application data can be sent.

### TLS 1.3 Handshake

TLS 1.3 significantly simplifies and speeds up the handshake.

```
Client                                Server
  |                                      |
  |--- ClientHello + KeyShare -------->  |  (TLS version, cipher suites, key share)
  |                                      |
  |<-- ServerHello + KeyShare ---------  |  (chosen cipher, key share)
  |<-- EncryptedExtensions ------------  |
  |<-- Certificate --------------------  |  (encrypted)
  |<-- CertificateVerify --------------  |  (encrypted)
  |<-- Finished -----------------------  |
  |                                      |
  |--- Finished ---------------------->  |
  |                                      |
  |==== Application Data (encrypted) ==  |
```

TLS 1.3 requires only **1 round trip**, and supports **0-RTT** (zero round trip time) resumption for repeat connections.

## Cipher Suites

A cipher suite defines the combination of algorithms used for key exchange, authentication, encryption, and integrity in a TLS connection.

**TLS 1.2 cipher suite example:**

```
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
 |    |     |        |    |    |
 |    |     |        |    |    +-- Hash for PRF (SHA-256)
 |    |     |        |    +-- Mode (GCM = authenticated encryption)
 |    |     |        +-- Bulk cipher (AES-128)
 |    |     +-- Authentication (RSA certificate)
 |    +-- Key Exchange (ECDHE = Elliptic Curve Diffie-Hellman Ephemeral)
 +-- Protocol
```

**TLS 1.3 simplified cipher suites:**

```
TLS_AES_128_GCM_SHA256
TLS_AES_256_GCM_SHA384
TLS_CHACHA20_POLY1305_SHA256
```

TLS 1.3 removed all insecure algorithms and only supports AEAD (Authenticated Encryption with Associated Data) ciphers. Key exchange is always ephemeral Diffie-Hellman.

## TLS 1.3 Improvements

| Improvement | Description |
|-------------|-------------|
| **Faster handshake** | 1-RTT (vs 2-RTT in TLS 1.2), with 0-RTT resumption |
| **Removed insecure algorithms** | No RSA key exchange, no CBC mode, no RC4, no SHA-1 |
| **Forward secrecy by default** | All key exchanges use ephemeral keys |
| **Encrypted handshake** | Certificate is encrypted (unlike TLS 1.2) |
| **Simplified cipher suites** | Only 5 cipher suites, all AEAD |
| **Removed compression** | Prevents CRIME/BREACH attacks |

## Certificates

TLS certificates use the X.509 standard and are essential for the server to prove its identity.

```bash
# View certificate details
openssl s_client -connect example.com:443 -brief

# View full certificate information
openssl s_client -connect example.com:443 </dev/null 2>/dev/null | openssl x509 -text -noout

# Check certificate expiration
openssl s_client -connect example.com:443 </dev/null 2>/dev/null | openssl x509 -noout -dates
```

## Forward Secrecy

Forward secrecy (also called perfect forward secrecy) ensures that past communications cannot be decrypted even if the server's private key is compromised in the future. This is achieved by using ephemeral key exchange algorithms (ECDHE or DHE) that generate unique session keys for each connection.

```
Without forward secrecy:
  Compromised private key --> All past sessions can be decrypted

With forward secrecy (ECDHE):
  Compromised private key --> Past sessions remain encrypted
  (each session used a unique ephemeral key that was discarded)
```

## Server Configuration Best Practices

```nginx
# Nginx TLS configuration (modern)
server {
    listen 443 ssl http2;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
}
```

## Testing TLS Configuration

```bash
# Test with openssl
openssl s_client -connect example.com:443 -tls1_3

# Test specific cipher
openssl s_client -connect example.com:443 -cipher ECDHE-RSA-AES128-GCM-SHA256

# Online testing
# https://www.ssllabs.com/ssltest/
# https://observatory.mozilla.org/
```

## Common Vulnerabilities

| Vulnerability | Affected | Description |
|--------------|----------|-------------|
| **POODLE** | SSL 3.0 | Padding oracle attack on CBC mode |
| **BEAST** | TLS 1.0 | Browser exploit against CBC ciphers |
| **Heartbleed** | OpenSSL | Buffer over-read exposing server memory |
| **CRIME/BREACH** | TLS compression | Compression side-channel leaks data |
| **FREAK/Logjam** | Export ciphers | Downgrade to weak 512-bit keys |

All of these are mitigated by using TLS 1.2+ with modern cipher suites and keeping libraries updated.

## Resources

- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)
- [RFC 8446 - TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [Illustrated TLS 1.3 Connection](https://tls13.xargs.org/)
- [Cloudflare - What is TLS?](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
