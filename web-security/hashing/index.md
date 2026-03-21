# Hashing

Hashing is the process of transforming input data of any size into a fixed-size output using a mathematical function. Hash functions are one-way operations -- you can compute a hash from an input, but you cannot recover the original input from the hash. Hashing is foundational to password storage, data integrity verification, digital signatures, and many other security mechanisms.

---

## How Hashing Works

A hash function takes an input (or "message") and returns a fixed-length string of bytes. The output is typically represented as a hexadecimal string.

```
Input: "hello"        --> SHA-256 --> 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
Input: "hello!"       --> SHA-256 --> ce06092fb948d9ffac7d1a376e404b26b7575bcc11ee05a4615fef4fec3a308b
Input: (1 GB file)    --> SHA-256 --> (still 64 hex characters)
```

No matter how large or small the input, the output length is always the same for a given algorithm.

## Properties of a Good Hash Function

| Property | Description |
|----------|-------------|
| **Deterministic** | The same input always produces the same output |
| **Fixed Output Size** | Output length is constant regardless of input size |
| **One-Way (Preimage Resistance)** | Given a hash, it is computationally infeasible to find the original input |
| **Collision Resistance** | It is extremely difficult to find two different inputs that produce the same hash |
| **Avalanche Effect** | A small change in input produces a drastically different output |
| **Fast to Compute** | The hash can be computed efficiently (except for password hashing, where slowness is desired) |

## Collision Resistance

A collision occurs when two different inputs produce the same hash output. Because hash outputs are fixed-size and inputs are unbounded, collisions must theoretically exist (by the pigeonhole principle). However, a secure hash function makes finding such collisions computationally infeasible.

```
Collision example (MD5 - broken):
Input A: "message1"  --> MD5 --> d41d8cd98f00b204e9800998ecf8427e
Input B: "message2"  --> MD5 --> d41d8cd98f00b204e9800998ecf8427e  (hypothetical)
```

When a hash function's collision resistance is broken, it can no longer be trusted for security purposes. This is exactly what happened with MD5 and SHA-1.

## Common Use Cases

| Use Case | Recommended Algorithm | Why |
|----------|----------------------|-----|
| **Password Storage** | bcrypt, scrypt, Argon2 | Intentionally slow to resist brute-force attacks |
| **Data Integrity** | SHA-256, SHA-3 | Verifies files and messages have not been tampered with |
| **Digital Signatures** | SHA-256, SHA-512 | Ensures authenticity and non-repudiation |
| **Hash Tables / Checksums** | MurmurHash, xxHash | Speed-optimized, not for security |
| **HMAC (Message Authentication)** | HMAC-SHA256 | Verifies both integrity and authenticity using a secret key |

## Code Example

```python
import hashlib

# Basic SHA-256 hashing
message = "Hello, World!"
hash_object = hashlib.sha256(message.encode())
hex_digest = hash_object.hexdigest()
print(f"SHA-256: {hex_digest}")

# Demonstrating the avalanche effect
message2 = "Hello, World"  # removed the exclamation mark
hash_object2 = hashlib.sha256(message2.encode())
print(f"SHA-256: {hash_object2.hexdigest()}")
# Completely different hash despite a tiny input change
```

```javascript
// Node.js hashing
const crypto = require('crypto');

const hash = crypto.createHash('sha256')
  .update('Hello, World!')
  .digest('hex');

console.log(`SHA-256: ${hash}`);
```

## General-Purpose vs Password Hashing

It is critical to understand the distinction between general-purpose hash functions and password hashing functions:

- **General-purpose** (SHA-256, SHA-3): Designed to be fast. Suitable for data integrity and signatures.
- **Password hashing** (bcrypt, scrypt, Argon2): Designed to be slow and resource-intensive. This deliberate slowness makes brute-force and dictionary attacks impractical.

> **Rule:** Never use a general-purpose hash function like SHA-256 to hash passwords directly. Always use a dedicated password hashing algorithm with a salt and configurable work factor.

## Resources

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [MDN Web Docs - SubtleCrypto.digest()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)
- [Cryptographic Hash Function - Wikipedia](https://en.wikipedia.org/wiki/Cryptographic_hash_function)
- [NIST Hash Functions](https://csrc.nist.gov/projects/hash-functions)
- [Serious Cryptography by Jean-Philippe Aumasson](https://nostarch.com/seriouscrypto)
