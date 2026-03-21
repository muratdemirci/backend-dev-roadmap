# MD5 (Message-Digest Algorithm 5)

MD5 is a widely known cryptographic hash function that produces a 128-bit (16-byte) hash value, typically rendered as a 32-character hexadecimal string. Designed by Ronald Rivest in 1991, MD5 was once the standard for checksums and data integrity. However, it is now considered cryptographically broken and unsuitable for security purposes.

---

## How MD5 Works

MD5 processes input data in 512-bit blocks through four rounds of operations. Each round applies a different nonlinear function, modular addition, and bit rotation to produce the final 128-bit digest.

**High-level steps:**

1. **Padding** -- The message is padded so its length is congruent to 448 mod 512. A 64-bit representation of the original length is appended.
2. **Initialization** -- Four 32-bit state variables (A, B, C, D) are initialized with fixed constants.
3. **Processing** -- The padded message is divided into 512-bit blocks. Each block is processed through 64 operations across four rounds.
4. **Output** -- The final values of A, B, C, D are concatenated to form the 128-bit hash.

```
Input: "hello"
MD5:   5d41402abc4b2a76b9719d911017c592

Input: "hello " (added a space)
MD5:   1f09d30c707d53f3d16c530dd73d70a6
```

## Why MD5 Is Broken

MD5's collision resistance has been thoroughly compromised. Researchers have demonstrated practical attacks that can generate collisions in seconds on modern hardware.

### Timeline of MD5 Vulnerabilities

| Year | Event |
|------|-------|
| 1996 | Hans Dobbertin found collisions in MD5's compression function |
| 2004 | Xiaoyun Wang demonstrated full MD5 collisions |
| 2006 | Researchers created two different X.509 certificates with the same MD5 hash |
| 2008 | Researchers used MD5 collisions to create a rogue CA certificate |
| 2012 | The Flame malware exploited MD5 collisions to forge Windows Update signatures |

### Collision Attacks

A collision attack finds two distinct inputs that produce the same hash. With MD5, this can be done in seconds using algorithms like the one by Wang et al.

```python
import hashlib

# These two different byte strings produce the same MD5 hash
# (simplified illustration -- real collision pairs are binary data)
message_a = b"message content A"
message_b = b"message content B"

# In a real collision attack, specially crafted binary inputs
# will produce identical MD5 digests
hash_a = hashlib.md5(message_a).hexdigest()
hash_b = hashlib.md5(message_b).hexdigest()

print(f"MD5 of A: {hash_a}")
print(f"MD5 of B: {hash_b}")
# In a real collision: hash_a == hash_b despite message_a != message_b
```

### Preimage Attacks

While full preimage attacks on MD5 are not yet practical, significant theoretical weaknesses have been found. The 128-bit output also makes brute-force preimage attacks more feasible than with SHA-256 (which has 256 bits).

## Why MD5 Is Still Used (and Why It Should Not Be)

Despite being broken, MD5 persists in several contexts:

| Usage | Safe? | Explanation |
|-------|-------|-------------|
| File checksums (non-security) | Marginal | Detects accidental corruption, but not deliberate tampering |
| Password hashing | **No** | Extremely fast, no salt, trivially brute-forced |
| Digital signatures | **No** | Collisions allow forgery |
| HMAC-MD5 | Weak | HMAC construction provides some protection, but SHA-256 is preferred |
| Legacy system compatibility | Reluctantly | Only when migration is impossible and risk is documented |

## Demonstrating MD5 Speed

One of MD5's biggest problems for password hashing is speed. Modern GPUs can compute billions of MD5 hashes per second, making brute-force attacks trivial.

```bash
# Benchmarking MD5 on the command line
echo -n "password123" | md5sum
# Output: 482c811da5d5b4bc6d497ffa98491e38  -

# On macOS
echo -n "password123" | md5
# Output: 482c811da5d5b4bc6d497ffa98491e38
```

```python
import hashlib
import time

# Demonstrate how fast MD5 is (this is BAD for passwords)
start = time.time()
for i in range(1_000_000):
    hashlib.md5(f"password{i}".encode()).hexdigest()
elapsed = time.time() - start
print(f"1 million MD5 hashes in {elapsed:.2f} seconds")
# Typically completes in under 1 second on modern hardware
```

## Migration Away from MD5

If your system still uses MD5, plan a migration:

1. **Identify all MD5 usage** -- Search your codebase for `md5`, `MD5`, and related library calls.
2. **Replace with SHA-256 or SHA-3** for data integrity checks.
3. **Replace with bcrypt, scrypt, or Argon2** for password hashing.
4. **For stored password hashes** -- Rehash passwords on next successful login using the new algorithm. Keep the old MD5 hash until the user logs in.

```python
# Gradual password migration strategy
def login(username, password):
    user = get_user(username)

    if user.hash_algorithm == "md5":
        if hashlib.md5(password.encode()).hexdigest() == user.password_hash:
            # Rehash with bcrypt on successful login
            new_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))
            update_user_hash(username, new_hash, algorithm="bcrypt")
            return True
    elif user.hash_algorithm == "bcrypt":
        return bcrypt.checkpw(password.encode(), user.password_hash)

    return False
```

> **Rule:** MD5 should never be used for any security-sensitive purpose in new projects. Treat any existing MD5 usage as technical debt that needs remediation.

## Resources

- [RFC 1321 - The MD5 Message-Digest Algorithm](https://www.rfc-editor.org/rfc/rfc1321)
- [How to Break MD5 and Other Hash Functions - Xiaoyun Wang](https://link.springer.com/chapter/10.1007/11426639_2)
- [OWASP: Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [MD5 Collision Demo - corkami](https://github.com/corkami/collisions)
- [Why MD5 Is Broken - Computerphile (YouTube)](https://www.youtube.com/watch?v=b4b8ktEV4Bg)
