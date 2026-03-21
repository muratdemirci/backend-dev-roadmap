# Memcached

Memcached is a high-performance, distributed, in-memory key-value store designed for simplicity and speed. It was originally developed by Brad Fitzpatrick for LiveJournal in 2003 and is used to cache database query results, API responses, and session data to reduce load on backend systems.

## Core Design Philosophy

Memcached focuses on doing one thing well: caching key-value pairs in memory with minimal overhead.

- **Simple**: Only supports string key-value pairs
- **Fast**: Entirely in-memory with O(1) operations
- **Distributed**: Scales horizontally by adding more servers
- **Volatile**: Data is not persisted; it is lost on restart

## How It Works

```
1. Application checks Memcached for the requested key
2. Cache HIT: Returns the value directly (sub-millisecond)
3. Cache MISS: Application fetches data from the database
4. Application stores the result in Memcached with a TTL
5. Subsequent requests are served from cache until expiry
```

## Basic Operations

```bash
# Using telnet or a Memcached client
set user:42 0 3600 11      # key, flags, ttl, byte count
Jane Doe                    # value
STORED

get user:42
VALUE user:42 0 11
Jane Doe
END

delete user:42
DELETED

incr pageviews:home 1
decr stock:item:99 5
```

## Node.js Example

```javascript
const Memcached = require('memcached');
const memcached = new Memcached('127.0.0.1:11211');

// Set a value with 1-hour TTL
memcached.set('user:42', { name: 'Jane Doe', email: 'jane@example.com' }, 3600, (err) => {
  if (err) console.error(err);
});

// Get a value
memcached.get('user:42', (err, data) => {
  if (err) console.error(err);
  console.log(data); // { name: 'Jane Doe', email: 'jane@example.com' }
});

// Cache-aside pattern
async function getCachedUser(userId) {
  return new Promise((resolve, reject) => {
    const key = `user:${userId}`;
    memcached.get(key, async (err, data) => {
      if (err) return reject(err);
      if (data) return resolve(data);

      const user = await db.findUser(userId);
      memcached.set(key, user, 3600, () => {});
      resolve(user);
    });
  });
}
```

## Slab Allocation

Memcached manages memory using a slab allocation system to avoid fragmentation.

```
Memory is divided into slab classes:
  Slab Class 1: 96-byte chunks
  Slab Class 2: 120-byte chunks
  Slab Class 3: 152-byte chunks
  ...
  Slab Class N: 1 MB chunks (max item size)
```

- Each slab class holds items of a specific size range
- When an item is stored, Memcached assigns it to the smallest slab class that fits
- Pages (1 MB each) are allocated to slab classes as needed
- Items within a slab class are evicted using LRU when the class is full

### Implications

- Items smaller than the chunk size waste memory (internal fragmentation)
- The default maximum item size is 1 MB (configurable with `-I`)
- Monitor slab class usage with `stats slabs` to identify imbalances

## Consistent Hashing

In a distributed Memcached setup, clients use consistent hashing to determine which server stores each key.

```
Servers: A, B, C

Hash Ring:
  ┌──────────────────────┐
  │    A       B       C │
  │  ╱   ╲  ╱   ╲  ╱   ╲│
  └──────────────────────┘

key "user:42"  → hashes to Server B
key "user:99"  → hashes to Server A
key "user:150" → hashes to Server C
```

When a server is added or removed, only a fraction of keys need to be remapped, minimizing cache invalidation.

```javascript
// Node.js with multiple servers
const Memcached = require('memcached');
const memcached = new Memcached([
  '10.0.0.1:11211',
  '10.0.0.2:11211',
  '10.0.0.3:11211'
]);
// The client handles consistent hashing automatically
```

## Memcached vs Redis

| Feature | Memcached | Redis |
|---------|-----------|-------|
| Data structures | Strings only | Strings, hashes, lists, sets, sorted sets, streams |
| Persistence | None | RDB snapshots, AOF |
| Eviction | LRU per slab class | Configurable (LRU, LFU, TTL, etc.) |
| Pub/Sub | No | Yes |
| Scripting | No | Lua scripting |
| Clustering | Client-side (consistent hashing) | Built-in cluster mode |
| Replication | No native replication | Primary-replica replication |
| Multi-threading | Yes (multi-threaded) | Single-threaded (with I/O threads in v6+) |
| Memory efficiency | Better for simple key-value caching | Higher overhead per key |
| Max item size | 1 MB (default) | 512 MB |

### When to Choose Memcached

- Simple key-value caching with no need for advanced data structures
- Multi-threaded workloads where you want to leverage multiple CPU cores
- Very high throughput for simple GET/SET operations
- When you explicitly do not want persistence (pure cache)

### When to Choose Redis

- You need data structures beyond simple strings
- You need persistence or replication
- You need pub/sub, Lua scripting, or transactions
- You need built-in clustering and automatic failover

## Configuration

```bash
# Start Memcached with common options
memcached \
  -m 512          # 512 MB memory
  -p 11211        # Port
  -c 1024         # Max connections
  -t 4            # Number of threads
  -I 2m           # Max item size (2 MB)
  -v              # Verbose logging
```

## Monitoring

```bash
# Get general stats
echo "stats" | nc 127.0.0.1 11211

# Key metrics to monitor
# - get_hits / get_misses  → Cache hit ratio
# - curr_items             → Number of items in cache
# - bytes                  → Memory used
# - evictions              → Number of items evicted (high = needs more memory)
# - curr_connections       → Active client connections
```

## Best Practices

- **Set appropriate TTLs**: Avoid stale data while maximizing cache hits
- **Monitor hit ratios**: Aim for 90%+ hit rates; low rates indicate poor cache utilization
- **Use consistent hashing**: Minimizes cache misses when scaling the cluster
- **Avoid hot keys**: Distribute load evenly across keys to prevent bottlenecks
- **Size your memory correctly**: Monitor eviction rates and scale accordingly
- **Do not store critical data**: Memcached is volatile; always have a fallback to the source

## Resources

- [Memcached Official Wiki](https://github.com/memcached/memcached/wiki)
- [Memcached Protocol](https://github.com/memcached/memcached/blob/master/doc/protocol.txt)
- [node-memcached Client](https://github.com/3rd-Eden/memcached)
- [Consistent Hashing Explained](https://www.toptal.com/big-data/consistent-hashing)
- [Scaling Memcached at Facebook](https://research.facebook.com/publications/scaling-memcache-at-facebook/)
