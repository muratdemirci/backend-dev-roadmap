# Server-Side Caching

Server-side caching stores frequently accessed data in fast storage layers on the server to reduce database load, speed up response times, and improve application scalability. Instead of computing or fetching data from scratch on every request, the server returns a cached result.

## Why Server-Side Caching?

Without caching, every request may involve:
- Database queries
- External API calls
- Complex computations
- Template rendering

Caching eliminates redundant work by storing results that can be reused across requests.

## Types of Server-Side Caching

### In-Memory Caching

Stores data directly in the application's memory (RAM). Fastest option, but limited to a single process and lost on restart.

```javascript
// Simple in-memory cache with TTL
class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlMs = 60000) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  delete(key) {
    this.store.delete(key);
  }
}

const cache = new MemoryCache();
```

### Distributed Cache

A shared cache accessible by multiple application instances. Essential for horizontally scaled applications.

```
App Instance 1 ──┐
App Instance 2 ──┼──> Distributed Cache (Redis/Memcached) ──> Database
App Instance 3 ──┘
```

Popular options: **Redis**, **Memcached**, **Hazelcast**

### HTTP Response Caching

Caching entire HTTP responses at the reverse proxy level (Nginx, Varnish).

```nginx
# Nginx proxy cache configuration
proxy_cache_path /var/cache/nginx levels=1:2
    keys_zone=api_cache:10m max_size=1g inactive=60m;

server {
    location /api/ {
        proxy_cache api_cache;
        proxy_cache_valid 200 10m;
        proxy_cache_valid 404 1m;
        proxy_cache_key "$request_uri";
        proxy_pass http://backend;

        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

## Cache Patterns

### Cache-Aside (Lazy Loading)

The application checks the cache first. On a miss, it fetches from the source, stores the result in the cache, and returns it.

```javascript
async function getUser(userId) {
  const cacheKey = `user:${userId}`;

  // Check cache
  let user = await redis.get(cacheKey);
  if (user) return JSON.parse(user);

  // Cache miss: fetch from database
  user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

  // Store in cache
  await redis.set(cacheKey, JSON.stringify(user), 'EX', 3600);

  return user;
}
```

### Write-Through

Data is written to the cache and the database simultaneously. The cache is always up to date.

```javascript
async function updateUser(userId, data) {
  // Update database
  await db.query('UPDATE users SET name = $1 WHERE id = $2', [data.name, userId]);

  // Update cache
  const user = { id: userId, ...data };
  await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 3600);

  return user;
}
```

### Write-Behind (Write-Back)

Data is written to the cache first and asynchronously persisted to the database. Faster writes, but risk of data loss.

### Read-Through

Similar to cache-aside, but the cache itself handles fetching from the source on a miss.

## Cache Pattern Comparison

| Pattern | Read Performance | Write Performance | Consistency | Complexity |
|---------|-----------------|-------------------|-------------|------------|
| Cache-Aside | Fast (on hit) | N/A | Eventual | Low |
| Write-Through | Fast | Moderate | Strong | Medium |
| Write-Behind | Fast | Fast | Eventual | High |
| Read-Through | Fast (on hit) | N/A | Eventual | Medium |

## Cache Invalidation Strategies

| Strategy | Description |
|----------|-------------|
| **TTL (Time-to-Live)** | Cache expires after a fixed duration |
| **Event-based** | Invalidate when data changes (pub/sub, webhooks) |
| **Version-based** | Append a version to cache keys; increment on updates |
| **Manual purge** | Explicitly delete cache entries on write operations |

```javascript
// Event-based invalidation example
async function updateProduct(productId, data) {
  await db.query('UPDATE products SET price = $1 WHERE id = $2', [data.price, productId]);

  // Invalidate related caches
  await redis.del(`product:${productId}`);
  await redis.del('products:list');
  await redis.del(`category:${data.categoryId}:products`);
}
```

## Cache Stampede Prevention

When a popular cache key expires, many requests simultaneously hit the database (thundering herd). Solutions:

```javascript
// Lock-based prevention
async function getWithLock(key, fetchFn, ttl = 3600) {
  let value = await redis.get(key);
  if (value) return JSON.parse(value);

  const lockKey = `lock:${key}`;
  const acquired = await redis.set(lockKey, '1', 'NX', 'EX', 10);

  if (acquired) {
    value = await fetchFn();
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
    await redis.del(lockKey);
    return value;
  }

  // Wait and retry if another process holds the lock
  await new Promise(resolve => setTimeout(resolve, 100));
  return getWithLock(key, fetchFn, ttl);
}
```

## Caching Best Practices

- **Cache what is expensive**: Database queries, external API calls, computed results
- **Set appropriate TTLs**: Balance freshness against performance
- **Monitor cache hit rates**: Low hit rates indicate poor key design or TTLs
- **Plan for cache failure**: The application should work (slower) without the cache
- **Use namespaced keys**: Prevent collisions (`user:42:profile`, `product:99:details`)
- **Limit cache size**: Configure eviction policies (LRU, LFU) to prevent memory exhaustion

## Resources

- [AWS Caching Best Practices](https://aws.amazon.com/caching/best-practices/)
- [Redis Documentation](https://redis.io/docs/)
- [Nginx Proxy Cache](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache)
- [Martin Fowler - Two Hard Things](https://martinfowler.com/bliki/TwoHardThings.html)
- [Caching Strategies - DZone](https://dzone.com/articles/caching-strategies)
