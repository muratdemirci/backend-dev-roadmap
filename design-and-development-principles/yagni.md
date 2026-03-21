# YAGNI (You Aren't Gonna Need It)

YAGNI is a software development principle from Extreme Programming (XP) that states you should not implement functionality until it is actually needed. The name is a direct reminder: that feature, abstraction, or configuration option you are thinking of adding "just in case" -- you probably are not going to need it. YAGNI fights the natural developer instinct to over-build and future-proof.

---

## Origins in Extreme Programming

YAGNI was formalized by Ron Jeffries and Kent Beck as part of the Extreme Programming methodology in the late 1990s. XP emphasizes delivering working software in small increments and adapting to change rather than trying to predict the future.

The principle is grounded in a simple observation: **requirements change**. The feature you build today for a hypothetical future need may never be used, or the actual need may look completely different from what you predicted.

## The Cost of Premature Features

Building something you do not need yet has four categories of cost:

| Cost | Description |
|------|-------------|
| **Cost of building** | Time spent designing, coding, and testing the feature |
| **Cost of delay** | Time not spent on features that are actually needed now |
| **Cost of carry** | Ongoing maintenance, documentation, and cognitive load |
| **Cost of repair** | If the prediction was wrong, the cost to change or remove it |

> **"The best code is no code at all. Every line of code you write is a line that has to be debugged, a line that has to be read and understood, a line that has to be supported."** -- Jeff Atwood

## Examples of YAGNI Violations

### Building for Multiple Databases

```python
# YAGNI violation: abstract database layer when you only use PostgreSQL
class DatabaseAdapter:
    def connect(self): raise NotImplementedError
    def query(self): raise NotImplementedError

class PostgresAdapter(DatabaseAdapter):
    def connect(self): ...
    def query(self): ...

class MySQLAdapter(DatabaseAdapter):
    def connect(self): ...
    def query(self): ...

class MongoAdapter(DatabaseAdapter):
    def connect(self): ...
    def query(self): ...

# YAGNI: just use PostgreSQL directly
import psycopg2
conn = psycopg2.connect("dbname=myapp")
```

If you ever actually need MySQL support, you can add the abstraction then -- with the benefit of knowing the real requirements.

### Premature Configuration

```javascript
// YAGNI violation: configurable everything
const config = {
  maxRetries: process.env.MAX_RETRIES || 3,
  retryDelay: process.env.RETRY_DELAY || 1000,
  retryBackoffMultiplier: process.env.RETRY_BACKOFF || 2,
  retryJitter: process.env.RETRY_JITTER || true,
  retryMaxDelay: process.env.RETRY_MAX_DELAY || 30000,
  retryOnTimeout: process.env.RETRY_ON_TIMEOUT || true,
  retryOnServerError: process.env.RETRY_ON_SERVER_ERROR || true,
  retryOn429: process.env.RETRY_ON_429 || true
};

// YAGNI: start simple, configure what you actually need
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry(url) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      if (i === MAX_RETRIES - 1) throw err;
      await sleep(RETRY_DELAY);
    }
  }
}
```

### Plugin System for a Single Use Case

```javascript
// YAGNI violation: plugin architecture when you have one export format
class ExportPluginManager {
  constructor() { this.plugins = new Map(); }
  register(name, plugin) { this.plugins.set(name, plugin); }
  export(name, data) { return this.plugins.get(name).export(data); }
}

// YAGNI: just write the CSV export
function exportToCsv(data) {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  return [headers, ...rows].join('\n');
}
```

## When to Apply YAGNI

Apply YAGNI when you catch yourself:
- Adding parameters or options "for flexibility"
- Building abstractions for a single implementation
- Creating interfaces with only one implementor
- Adding support for scenarios that no one has requested
- Writing code to handle edge cases that have never occurred

## When YAGNI Does Not Apply

YAGNI is not an excuse to ignore:
- **Security** -- Always implement authentication, authorization, and input validation from the start.
- **Fundamental architecture** -- Choosing a database, programming language, or deployment model is a decision with high reversal cost.
- **Known requirements** -- If the product roadmap clearly calls for a feature in the next sprint, planning for it is reasonable.
- **Regulatory compliance** -- GDPR, HIPAA, and similar requirements must be addressed upfront.

## YAGNI vs Good Design

YAGNI does not mean writing sloppy code. It means writing clean, well-structured code that solves today's problems without prematurely solving tomorrow's hypothetical problems.

```
Good design + YAGNI:
  - Clean, readable code
  - Single responsibility
  - Easy to extend WHEN the need arises
  - No unused abstractions

Bad design disguised as YAGNI:
  - Spaghetti code
  - No structure
  - Hard to change later
  - Technical debt
```

> **Tip:** Write code that is easy to change, not code that anticipates every possible change. The former is good engineering; the latter is guesswork.

## Relationship to Other Principles

| Principle | Relationship |
|-----------|-------------|
| **KISS** | Complementary -- both favor simplicity over complexity |
| **DRY** | Can conflict -- premature DRY creates unnecessary abstractions |
| **SOLID** | Complementary -- SOLID makes code easy to extend when you do need to |
| **Agile** | Aligned -- both embrace iterative development and responding to change |

## Resources

- [YAGNI - Martin Fowler](https://martinfowler.com/bliki/Yagni.html)
- [Extreme Programming Explained - Kent Beck](https://www.oreilly.com/library/view/extreme-programming-explained/0321278658/)
- [The Art of Agile Development - James Shore](https://www.jamesshore.com/v2/books/aoad2)
- [You Aren't Gonna Need It - c2 wiki](https://wiki.c2.com/?YouArentGonnaNeedIt)
