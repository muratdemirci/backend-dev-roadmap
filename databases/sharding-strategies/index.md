# Sharding Strategies

Sharding is a horizontal scaling technique that distributes data across multiple database instances (called shards). Each shard holds a subset of the total data, allowing the system to handle more traffic and store more data than a single server could manage. Sharding is essential when vertical scaling (adding more resources to a single server) reaches its limits.

## Why Shard?

- **Horizontal Scalability**: Distribute data and load across many machines.
- **Improved Performance**: Each shard handles a fraction of the total queries.
- **Increased Storage**: Total capacity is the sum of all shards.
- **Fault Isolation**: A failure in one shard does not affect the others.

## Sharding Key

The sharding key (also called the partition key) determines how data is distributed across shards. Choosing the right sharding key is the most critical decision when implementing sharding.

### Good Sharding Key Properties

- **High cardinality**: Many distinct values to ensure even distribution.
- **Even distribution**: Avoid hotspots where one shard receives most of the traffic.
- **Query alignment**: The key should match how data is most commonly accessed.

## Hash-Based Sharding

A hash function is applied to the sharding key, and the result determines which shard holds the data.

```
shard_number = hash(sharding_key) % number_of_shards
```

```python
import hashlib

def get_shard(user_id, num_shards):
    hash_value = int(hashlib.md5(str(user_id).encode()).hexdigest(), 16)
    return hash_value % num_shards

# Examples
print(get_shard("user_1001", 4))  # -> shard 2
print(get_shard("user_1002", 4))  # -> shard 0
```

### Advantages

- Even data distribution across shards.
- Simple to implement and understand.

### Disadvantages

- Range queries become expensive (must query all shards).
- Adding or removing shards requires rehashing most data.
- No locality of related data.

## Range-Based Sharding

Data is divided into contiguous ranges based on the sharding key value.

```
Shard 0: user_id    1 - 1,000,000
Shard 1: user_id    1,000,001 - 2,000,000
Shard 2: user_id    2,000,001 - 3,000,000
```

```python
def get_shard_range(user_id):
    if user_id <= 1_000_000:
        return 'shard_0'
    elif user_id <= 2_000_000:
        return 'shard_1'
    else:
        return 'shard_2'
```

### Advantages

- Range queries are efficient (only one or a few shards need to be queried).
- Easy to understand and implement.

### Disadvantages

- Uneven distribution if data is not uniformly distributed.
- Hotspots can occur on the shard handling the latest range (e.g., newest users).
- Requires rebalancing when ranges become uneven.

## Geo-Based Sharding

Data is partitioned based on geographic location. Each shard serves a specific region, keeping data close to the users who access it.

```
Shard US:     Users in North America
Shard EU:     Users in Europe
Shard APAC:   Users in Asia-Pacific
```

```python
def get_shard_geo(user_region):
    shard_map = {
        'US': 'shard_us_east',
        'CA': 'shard_us_east',
        'UK': 'shard_eu_west',
        'DE': 'shard_eu_west',
        'JP': 'shard_apac',
        'AU': 'shard_apac'
    }
    return shard_map.get(user_region, 'shard_default')
```

### Advantages

- Low latency for users (data is geographically close).
- Compliance with data residency regulations (e.g., GDPR).

### Disadvantages

- Uneven distribution if user base is concentrated in certain regions.
- Cross-region queries are expensive.
- Complex setup and management.

## Consistent Hashing

Consistent hashing solves the rehashing problem of basic hash-based sharding. Instead of assigning data based on `hash % N`, both data and shards are placed on a virtual ring.

### How It Works

1. Each shard is placed at one or more positions on a hash ring (0 to 2^32).
2. To find the shard for a key, hash the key and walk clockwise on the ring until a shard is found.
3. When a shard is added or removed, only the keys between the new/removed shard and its neighbor need to be redistributed.

```python
import hashlib
from bisect import bisect_right

class ConsistentHash:
    def __init__(self, nodes, virtual_nodes=150):
        self.ring = {}
        self.sorted_keys = []
        for node in nodes:
            for i in range(virtual_nodes):
                key = self._hash(f"{node}:{i}")
                self.ring[key] = node
                self.sorted_keys.append(key)
        self.sorted_keys.sort()

    def _hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def get_node(self, data_key):
        h = self._hash(data_key)
        idx = bisect_right(self.sorted_keys, h) % len(self.sorted_keys)
        return self.ring[self.sorted_keys[idx]]

# Usage
nodes = ['shard_1', 'shard_2', 'shard_3']
ch = ConsistentHash(nodes)
print(ch.get_node('user:1001'))  # -> shard_2
print(ch.get_node('user:1002'))  # -> shard_1
```

### Advantages

- Minimal data movement when shards are added or removed.
- Virtual nodes ensure more even distribution.
- Used by Cassandra, DynamoDB, and many distributed caches.

### Disadvantages

- More complex to implement than simple hash or range sharding.
- Virtual nodes add memory overhead.

## Sharding Challenges

| Challenge             | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| Cross-shard queries   | JOINs across shards are expensive or impossible                |
| Transactions          | Distributed transactions add latency and complexity            |
| Rebalancing           | Moving data between shards is operationally disruptive         |
| Schema changes        | DDL must be applied to every shard                             |
| Unique constraints    | Global uniqueness is hard to enforce across shards             |
| Hotspots              | Poor key selection leads to uneven load                        |

## Sharding vs Partitioning

- **Partitioning**: Splits data within a single database instance (e.g., PostgreSQL table partitioning).
- **Sharding**: Splits data across multiple database instances, each on separate hardware.

Both techniques can be combined: shard across multiple servers, then partition within each shard.

## Resources

- [Designing Data-Intensive Applications - Chapter 6](https://dataintensive.net/)
- [Consistent Hashing - Wikipedia](https://en.wikipedia.org/wiki/Consistent_hashing)
- [MongoDB Sharding Documentation](https://www.mongodb.com/docs/manual/sharding/)
- [Vitess - Sharding for MySQL](https://vitess.io/)
- [System Design Primer - Sharding](https://github.com/donnemartin/system-design-primer#sharding)
