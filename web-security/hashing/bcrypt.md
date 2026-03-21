# bcrypt

bcrypt is a password hashing function designed by Niels Provos and David Mazieres in 1999. Based on the Blowfish cipher, bcrypt was specifically built to be slow and resistant to brute-force attacks. It remains one of the most widely recommended algorithms for securely storing passwords and is available in virtually every programming language.

---

## Why bcrypt Exists

General-purpose hash functions like SHA-256 are designed to be fast. This is a problem for password hashing because an attacker with a GPU can compute billions of SHA-256 hashes per second. bcrypt solves this by being intentionally slow and including a configurable work factor that lets you increase the cost as hardware improves.

| Feature | SHA-256 | bcrypt |
|---------|---------|--------|
| **Speed** | Billions/sec on GPU | A few hundred/sec |
| **Built-in Salt** | No | Yes |
| **Adjustable Cost** | No | Yes (work factor) |
| **Designed For** | Data integrity | Password storage |

## How bcrypt Works

bcrypt applies the Blowfish key schedule 2^cost times, making the computation exponentially more expensive as the cost factor increases.

**Steps:**

1. **Generate a random salt** -- A 16-byte random value unique to each password.
2. **Derive the expensive key** -- The password and salt are used to run the Blowfish key schedule 2^cost times.
3. **Encrypt a constant** -- The resulting key encrypts the string "OrpheanBeholderScryDoubt" 64 times.
4. **Output** -- The salt, cost factor, and encrypted result are concatenated into the final hash string.

**bcrypt hash format:**

```
$2b$12$LJ3m4ys3Lg2VBe5E/Gpqgee1Nnvxlvabi77X7hrLzNKCfREOFGfS6
 |   |  |                     |
 |   |  |                     +-- Hash (31 characters, base64)
 |   |  +-- Salt (22 characters, base64)
 |   +-- Cost factor (2^12 = 4096 iterations)
 +-- Algorithm version ($2b$ is the current standard)
```

## Salt

A salt is random data added to the password before hashing. It ensures that two users with the same password get different hashes. bcrypt generates and stores the salt automatically as part of the hash string.

```
User A: password = "secret123" + salt_A --> hash_A
User B: password = "secret123" + salt_B --> hash_B
hash_A != hash_B  (different salts produce different hashes)
```

Without salts, attackers can use precomputed rainbow tables to look up hashes. Salts make rainbow tables impractical.

## Work Factor (Cost)

The work factor (or cost parameter) determines how many iterations bcrypt performs. It is expressed as a power of 2.

| Cost | Iterations | Approximate Time |
|------|-----------|-----------------|
| 10 | 1,024 | ~100 ms |
| 12 | 4,096 | ~300 ms |
| 14 | 16,384 | ~1 second |
| 16 | 65,536 | ~4 seconds |

> **Guideline:** Choose a cost factor that makes hashing take at least 100-250 ms on your server hardware. As of 2025, a cost of 12 is a reasonable starting point. Increase it over time as hardware gets faster.

## Code Examples

### Python

```python
import bcrypt

# Hash a password
password = b"my_secure_password"
salt = bcrypt.gensalt(rounds=12)  # Cost factor of 12
hashed = bcrypt.hashpw(password, salt)

print(f"Hash: {hashed.decode()}")
# Output: $2b$12$LJ3m4ys3Lg2VBe5E/Gpqgee1Nnvxlvabi77X7hrLzNKCfREOFGfS6

# Verify a password
if bcrypt.checkpw(b"my_secure_password", hashed):
    print("Password is correct")
else:
    print("Password is incorrect")
```

### Node.js

```javascript
const bcrypt = require('bcrypt');

async function hashPassword(plaintext) {
  const saltRounds = 12;
  const hash = await bcrypt.hash(plaintext, saltRounds);
  console.log(`Hash: ${hash}`);
  return hash;
}

async function verifyPassword(plaintext, hash) {
  const match = await bcrypt.compare(plaintext, hash);
  return match;
}

// Usage
const hash = await hashPassword('my_secure_password');
const isValid = await verifyPassword('my_secure_password', hash);
console.log(`Valid: ${isValid}`);  // true
```

### Go

```go
package main

import (
    "fmt"
    "golang.org/x/crypto/bcrypt"
)

func main() {
    password := []byte("my_secure_password")

    // Hash with cost 12
    hash, err := bcrypt.GenerateFromPassword(password, 12)
    if err != nil {
        panic(err)
    }
    fmt.Println("Hash:", string(hash))

    // Verify
    err = bcrypt.CompareHashAndPassword(hash, password)
    if err == nil {
        fmt.Println("Password is correct")
    }
}
```

## Password Hashing Best Practices

1. **Always use a unique salt per password** -- bcrypt handles this automatically.
2. **Set an appropriate work factor** -- Benchmark on your hardware and aim for 100-250 ms per hash.
3. **Increase the work factor over time** -- Rehash passwords when users log in if the stored hash uses an outdated cost.
4. **Enforce password length limits** -- bcrypt has a 72-byte input limit. Truncate or pre-hash longer passwords with SHA-256.
5. **Never log or expose password hashes** -- Treat hashes as sensitive data.
6. **Use constant-time comparison** -- Libraries like bcrypt do this internally during verification.
7. **Consider Argon2 for new projects** -- Argon2id is the current Password Hashing Competition winner and offers memory-hardness in addition to CPU cost.

## Limitations of bcrypt

- **72-byte password limit** -- bcrypt silently truncates passwords longer than 72 bytes. Pre-hash with SHA-256 if you need to support longer passwords.
- **CPU-only cost** -- bcrypt is CPU-intensive but not memory-intensive, making it more vulnerable to GPU and ASIC attacks compared to scrypt or Argon2.
- **No built-in parallelism resistance** -- Unlike Argon2, bcrypt does not have a parallelism parameter.

## Resources

- [bcrypt Paper - A Future-Adaptable Password Scheme (Provos & Mazieres)](https://www.usenix.org/legacy/events/usenix99/provos/provos.pdf)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [npm bcrypt](https://www.npmjs.com/package/bcrypt)
- [Python bcrypt](https://pypi.org/project/bcrypt/)
- [CrackStation - Password Hashing Security](https://crackstation.net/hashing-security.htm)
