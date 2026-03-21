# SHA Family (Secure Hash Algorithms)

The SHA family is a set of cryptographic hash functions published by the National Institute of Standards and Technology (NIST). These algorithms are the backbone of data integrity, digital signatures, certificate validation, and message authentication across the internet. Understanding the differences between SHA-1, SHA-2, and SHA-3 is essential for making informed security decisions.

---

## SHA-1

SHA-1 produces a 160-bit (20-byte) hash and was the dominant hash algorithm through the 2000s. It is now deprecated for security use.

| Property | Value |
|----------|-------|
| **Output Size** | 160 bits (40 hex characters) |
| **Block Size** | 512 bits |
| **Status** | Deprecated -- collision attacks demonstrated in 2017 |
| **Use Today** | Legacy systems only; avoid in new projects |

In 2017, Google and CWI Amsterdam demonstrated the first practical SHA-1 collision (the "SHAttered" attack), producing two different PDF files with the same SHA-1 hash.

```bash
# SHA-1 on command line
echo -n "hello" | shasum -a 1
# aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
```

## SHA-2

SHA-2 is a family of hash functions designed by the NSA and published by NIST in 2001. It includes several variants with different output sizes. SHA-256 and SHA-512 are the most widely used.

| Variant | Output Size | Block Size | Common Use |
|---------|-------------|------------|------------|
| **SHA-224** | 224 bits | 512 bits | Rarely used |
| **SHA-256** | 256 bits | 512 bits | TLS, certificates, blockchain, general integrity |
| **SHA-384** | 384 bits | 1024 bits | Government and high-security applications |
| **SHA-512** | 512 bits | 1024 bits | High-security, large data integrity |

SHA-256 is currently the most widely deployed secure hash function on the internet. It is used in TLS certificates, Bitcoin mining, code signing, and countless other applications.

```python
import hashlib

message = "Backend Developer Roadmap"

sha256 = hashlib.sha256(message.encode()).hexdigest()
sha512 = hashlib.sha512(message.encode()).hexdigest()

print(f"SHA-256: {sha256}")   # 64 hex characters
print(f"SHA-512: {sha512}")   # 128 hex characters
```

```javascript
const crypto = require('crypto');

const message = 'Backend Developer Roadmap';

const sha256 = crypto.createHash('sha256').update(message).digest('hex');
const sha512 = crypto.createHash('sha512').update(message).digest('hex');

console.log(`SHA-256: ${sha256}`);
console.log(`SHA-512: ${sha512}`);
```

## SHA-3

SHA-3 (Keccak) was selected by NIST in 2012 through a public competition as an alternative to SHA-2. It uses a completely different internal structure called a "sponge construction," which makes it resilient to the same classes of attacks that could theoretically threaten SHA-2.

| Variant | Output Size | Status |
|---------|-------------|--------|
| **SHA3-224** | 224 bits | Secure |
| **SHA3-256** | 256 bits | Secure |
| **SHA3-384** | 384 bits | Secure |
| **SHA3-512** | 512 bits | Secure |
| **SHAKE128** | Variable | Secure (extendable output) |
| **SHAKE256** | Variable | Secure (extendable output) |

SHA-3 is not a replacement for SHA-2 -- both are considered secure. SHA-3 provides algorithmic diversity so that if a structural weakness is found in SHA-2, there is a ready alternative built on different mathematics.

```python
import hashlib

message = "Backend Developer Roadmap"
sha3_256 = hashlib.sha3_256(message.encode()).hexdigest()
print(f"SHA3-256: {sha3_256}")
```

## Comparison

| Feature | SHA-1 | SHA-256 | SHA-512 | SHA3-256 |
|---------|-------|---------|---------|----------|
| **Output Size** | 160 bits | 256 bits | 512 bits | 256 bits |
| **Security** | Broken | Secure | Secure | Secure |
| **Speed** | Fast | Moderate | Moderate | Moderate |
| **Structure** | Merkle-Damgard | Merkle-Damgard | Merkle-Damgard | Sponge |
| **Adoption** | Legacy | Very High | High | Growing |
| **Recommendation** | Do not use | Preferred default | High-security use | Alternative to SHA-2 |

## HMAC (Hash-based Message Authentication Code)

HMAC combines a hash function with a secret key to provide both integrity and authenticity. Unlike a plain hash, HMAC proves that the message was created by someone who holds the secret key.

```
HMAC(key, message) = Hash((key XOR opad) || Hash((key XOR ipad) || message))
```

```python
import hmac
import hashlib

secret_key = b"my-secret-key"
message = b"important data"

# HMAC-SHA256
mac = hmac.new(secret_key, message, hashlib.sha256).hexdigest()
print(f"HMAC-SHA256: {mac}")

# Verification
def verify_hmac(key, message, expected_mac):
    computed = hmac.new(key, message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed, expected_mac)

is_valid = verify_hmac(secret_key, message, mac)
print(f"Valid: {is_valid}")
```

```javascript
const crypto = require('crypto');

const secretKey = 'my-secret-key';
const message = 'important data';

const mac = crypto.createHmac('sha256', secretKey)
  .update(message)
  .digest('hex');

console.log(`HMAC-SHA256: ${mac}`);
```

> **Important:** Always use `hmac.compare_digest()` (Python) or `crypto.timingSafeEqual()` (Node.js) for HMAC comparison. Standard string equality (`==`) is vulnerable to timing attacks.

## When to Use Which

| Scenario | Recommended |
|----------|-------------|
| General data integrity | SHA-256 |
| TLS / certificates | SHA-256 or SHA-384 |
| Digital signatures | SHA-256 or SHA-512 |
| API request signing | HMAC-SHA256 |
| Future-proofing / diversity | SHA3-256 |
| Password hashing | **None of these** -- use bcrypt, scrypt, or Argon2 |

## Resources

- [NIST Secure Hash Standard (FIPS 180-4)](https://csrc.nist.gov/publications/detail/fips/180/4/final)
- [NIST SHA-3 Standard (FIPS 202)](https://csrc.nist.gov/publications/detail/fips/202/final)
- [RFC 2104 - HMAC](https://www.rfc-editor.org/rfc/rfc2104)
- [SHAttered - SHA-1 Collision Attack](https://shattered.io/)
- [Crypto101 - Free Cryptography Book](https://www.crypto101.io/)
