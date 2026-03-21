# Redis

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store used as a cache, database, message broker, and streaming engine. It supports a rich set of data structures and provides sub-millisecond response times, making it one of the most popular choices for caching and real-time applications.

## Core Data Structures

Redis is more than a simple key-value store. It supports multiple data structures, each optimized for specific use cases.

### Strings

The most basic type. Can hold text, numbers, or binary data up to 512 MB.

```bash
SET user:42:name "Jane Doe"
GET user:42:name            # "Jane Doe"

SET counter 0
INCR counter                # 1
INCRBY counter 10           # 11

SET session:abc123 '{"userId":42}' EX 3600   # Expires in 1 hour
TTL session:abc123          # 3600
```

### Hashes

A map of field-value pairs, ideal for representing objects.

```bash
HSET user:42 name "Jane Doe" email "jane@example.com" role "admin"
HGET user:42 name           # "Jane Doe"
HGETALL user:42             # name "Jane Doe" email "jane@example.com" role "admin"
HDEL user:42 role
```

### Lists

Ordered collections of strings, useful for queues and timelines.

```bash
LPUSH queue:tasks "task1" "task2" "task3"
RPOP queue:tasks            # "task1"
LRANGE queue:tasks 0 -1     # ["task3", "task2"]
LLEN queue:tasks            # 2
```

### Sets

Unordered collections of unique strings.

```bash
SADD tags:article:1 "redis" "caching" "backend"
SMEMBERS tags:article:1     # {"redis", "caching", "backend"}
SISMEMBER tags:article:1 "redis"   # 1 (true)
SINTER tags:article:1 tags:article:2   # Intersection of two sets
```

### Sorted Sets

Sets where each member has a score, enabling range queries and leaderboards.

```bash
ZADD leaderboard 1500 "alice" 2300 "bob" 1800 "charlie"
ZRANGE leaderboard 0 -1 WITHSCORES        # Ascending
ZREVRANGE leaderboard 0 2 WITHSCORES      # Top 3
ZRANK leaderboard "bob"                    # 2 (0-indexed)
ZINCRBY leaderboard 500 "alice"            # 2000
```

## Using Redis with Node.js

```javascript
const Redis = require('ioredis');
const redis = new Redis({ host: '127.0.0.1', port: 6379 });

// Basic operations
await redis.set('key', 'value', 'EX', 3600);
const value = await redis.get('key');

// Hash operations
await redis.hset('user:42', { name: 'Jane', email: 'jane@example.com' });
const user = await redis.hgetall('user:42');

// Cache-aside pattern
async function getCachedUser(userId) {
  const cached = await redis.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);

  const user = await db.findUser(userId);
  await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 3600);
  return user;
}
```

## Pub/Sub

Redis supports publish/subscribe messaging for real-time communication between services.

```javascript
// Publisher
const pub = new Redis();
await pub.publish('notifications', JSON.stringify({
  type: 'order_placed',
  orderId: 1001
}));

// Subscriber
const sub = new Redis();
sub.subscribe('notifications');
sub.on('message', (channel, message) => {
  const data = JSON.parse(message);
  console.log(`Received on ${channel}:`, data);
});
```

## Lua Scripting

Redis can execute Lua scripts atomically, which is useful for complex operations that must be performed without interruption.

```bash
# Atomic rate limiter using Lua
EVAL "
  local current = redis.call('INCR', KEYS[1])
  if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  return current
" 1 "ratelimit:user:42" 60
```

```javascript
// Node.js with ioredis
const rateLimitScript = `
  local current = redis.call('INCR', KEYS[1])
  if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  return current
`;

const count = await redis.eval(rateLimitScript, 1, 'ratelimit:user:42', 60);
if (count > 100) {
  throw new Error('Rate limit exceeded');
}
```

## Persistence

Redis offers two persistence mechanisms:

| Method | Description | Trade-off |
|--------|-------------|-----------|
| **RDB (Snapshots)** | Periodic point-in-time snapshots to disk | Fast recovery, possible data loss between snapshots |
| **AOF (Append-Only File)** | Logs every write operation | More durable, larger file size, slower recovery |
| **RDB + AOF** | Both enabled simultaneously | Best durability, recommended for production |

```
# redis.conf
save 900 1          # Snapshot if 1 key changed in 900 seconds
save 300 10         # Snapshot if 10 keys changed in 300 seconds
appendonly yes      # Enable AOF
appendfsync everysec
```

## Clustering

Redis Cluster distributes data across multiple nodes using hash slots (16,384 total).

```
Node 1: Slots 0-5460
Node 2: Slots 5461-10922
Node 3: Slots 10923-16383
```

Each node can have replicas for high availability. If a primary fails, a replica is automatically promoted.

### Redis Sentinel

For simpler high-availability setups without sharding, Redis Sentinel monitors primary instances and handles automatic failover.

## Eviction Policies

When Redis reaches its memory limit, it evicts keys based on the configured policy.

| Policy | Description |
|--------|-------------|
| `noeviction` | Return error when memory is full |
| `allkeys-lru` | Evict least recently used keys |
| `volatile-lru` | Evict LRU keys with an expiration set |
| `allkeys-lfu` | Evict least frequently used keys |
| `volatile-ttl` | Evict keys with the shortest TTL |
| `allkeys-random` | Evict random keys |

```
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

## Resources

- [Redis Documentation](https://redis.io/docs/)
- [Redis University (Free Courses)](https://university.redis.com/)
- [ioredis (Node.js Client)](https://github.com/redis/ioredis)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)
- [Redis Cluster Tutorial](https://redis.io/docs/management/scaling/)
