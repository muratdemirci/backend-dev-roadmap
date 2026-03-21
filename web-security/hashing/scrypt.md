# scrypt

scrypt is a password-based key derivation function designed by Colin Percival in 2009. Its key innovation is **memory-hardness** -- it requires a large amount of RAM in addition to CPU time, making it significantly more expensive to attack with specialized hardware like GPUs, FPGAs, and ASICs. scrypt is used in password hashing, cryptocurrency mining (Litecoin), and key derivation.

---

## Why Memory-Hardness Matters

bcrypt is CPU-hard but uses very little memory. This means attackers can run many bcrypt computations in parallel on GPUs, which have thousands of cores but limited per-core memory. scrypt forces each computation to use a large block of memory, which limits parallelism on GPUs and makes custom ASIC attacks far more expensive.

```
bcrypt:  CPU-intensive only    --> GPU can run thousands in parallel
scrypt:  CPU + Memory-intensive --> GPU memory limits parallelism
```

| Attack Hardware | bcrypt Resistance | scrypt Resistance |
|----------------|-------------------|-------------------|
| CPU | High | High |
| GPU | Moderate | High (memory-limited) |
| FPGA | Moderate | High (memory cost) |
| ASIC | Low-Moderate | High (memory cost) |

## How scrypt Works

scrypt operates in three main phases:

1. **Key derivation (PBKDF2)** -- The password and salt are fed through PBKDF2-HMAC-SHA256 to produce an initial key.
2. **Memory-hard mixing (ROMix)** -- The key is expanded into a large memory buffer. Sequential memory-dependent operations ensure that the computation cannot be done without the full buffer in RAM.
3. **Final derivation (PBKDF2)** -- The mixed output is finalized through another round of PBKDF2 to produce the derived key.

## Parameters (N, r, p)

scrypt has three tunable parameters that control its cost:

| Parameter | Name | Controls | Typical Value |
|-----------|------|----------|---------------|
| **N** | CPU/Memory cost | Number of iterations; must be a power of 2 | 2^14 (16384) to 2^20 |
| **r** | Block size | Size of each memory block (in 128-byte chunks) | 8 |
| **p** | Parallelism | Number of independent mixing operations | 1 |

**Memory usage formula:**

```
Memory = 128 * N * r bytes

Example: N=16384, r=8
Memory = 128 * 16384 * 8 = 16 MB per hash
```

> **Guideline:** For interactive logins, use N=2^14 (16384), r=8, p=1 (about 16 MB, ~100 ms). For high-security or offline key derivation, use N=2^20 or higher.

## Code Examples

### Python

```python
import hashlib
import os

password = b"my_secure_password"
salt = os.urandom(16)

# scrypt key derivation
derived_key = hashlib.scrypt(
    password,
    salt=salt,
    n=16384,    # CPU/memory cost (2^14)
    r=8,        # Block size
    p=1,        # Parallelism
    dklen=64    # Output key length in bytes
)

print(f"Salt: {salt.hex()}")
print(f"Key:  {derived_key.hex()}")
```

### Node.js

```javascript
const crypto = require('crypto');

const password = 'my_secure_password';
const salt = crypto.randomBytes(16);

crypto.scrypt(password, salt, 64, {
  N: 16384,   // CPU/memory cost
  r: 8,       // Block size
  p: 1        // Parallelism
}, (err, derivedKey) => {
  if (err) throw err;
  console.log(`Salt: ${salt.toString('hex')}`);
  console.log(`Key:  ${derivedKey.toString('hex')}`);
});
```

### Go

```go
package main

import (
    "crypto/rand"
    "encoding/hex"
    "fmt"
    "golang.org/x/crypto/scrypt"
)

func main() {
    password := []byte("my_secure_password")
    salt := make([]byte, 16)
    rand.Read(salt)

    // N=16384, r=8, p=1, keyLen=64
    key, err := scrypt.Key(password, salt, 16384, 8, 1, 64)
    if err != nil {
        panic(err)
    }

    fmt.Printf("Salt: %s\n", hex.EncodeToString(salt))
    fmt.Printf("Key:  %s\n", hex.EncodeToString(key))
}
```

## scrypt vs bcrypt vs Argon2

| Feature | bcrypt | scrypt | Argon2 |
|---------|--------|--------|--------|
| **Year** | 1999 | 2009 | 2015 |
| **CPU-Hard** | Yes | Yes | Yes |
| **Memory-Hard** | No | Yes | Yes |
| **Parallelism Control** | No | Yes (p) | Yes (threads) |
| **Side-Channel Resistant** | Partial | Partial | Yes (Argon2id) |
| **Tunable Parameters** | Cost only | N, r, p | Time, memory, threads |
| **Max Password Length** | 72 bytes | Unlimited | Unlimited |
| **OWASP Recommendation** | Acceptable | Acceptable | Preferred (Argon2id) |
| **Adoption** | Very High | Moderate | Growing |

## Argon2 Overview

Argon2 won the Password Hashing Competition (PHC) in 2015 and is the current state-of-the-art. It comes in three variants:

- **Argon2d** -- Data-dependent memory access; maximizes resistance to GPU attacks but vulnerable to side-channel attacks.
- **Argon2i** -- Data-independent memory access; resistant to side-channel attacks but less GPU-resistant.
- **Argon2id** -- Hybrid of Argon2d and Argon2i; recommended for password hashing.

```python
# Argon2id example with argon2-cffi
from argon2 import PasswordHasher

ph = PasswordHasher(
    time_cost=3,       # Number of iterations
    memory_cost=65536,  # 64 MB
    parallelism=4       # 4 threads
)

hash = ph.hash("my_secure_password")
print(f"Hash: {hash}")

# Verify
try:
    ph.verify(hash, "my_secure_password")
    print("Password is valid")
except Exception:
    print("Password is invalid")
```

## Choosing the Right Algorithm

| Scenario | Recommendation |
|----------|---------------|
| New project, no constraints | Argon2id |
| Existing bcrypt infrastructure | bcrypt (migrate to Argon2id when feasible) |
| Need memory-hard, Argon2 unavailable | scrypt |
| Constrained/embedded environment | bcrypt |
| Key derivation from password | scrypt or Argon2 |

> **Tip:** Regardless of which algorithm you choose, always use a unique random salt per password, set the work factor high enough that hashing takes at least 100 ms, and increase the cost over time.

## Resources

- [scrypt Paper - Colin Percival](https://www.tarsnap.com/scrypt/scrypt.pdf)
- [RFC 7914 - The scrypt Password-Based Key Derivation Function](https://www.rfc-editor.org/rfc/rfc7914)
- [Argon2 Reference Implementation](https://github.com/P-H-C/phc-winner-argon2)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Password Hashing Competition](https://www.password-hashing.net/)
