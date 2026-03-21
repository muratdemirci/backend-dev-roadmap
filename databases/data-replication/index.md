# Data Replication

Data replication is the process of copying and maintaining database objects across multiple servers or locations. It is a fundamental technique for achieving high availability, fault tolerance, improved read performance, and disaster recovery. When one server fails, others can continue serving requests with minimal or no downtime.

## Why Replicate Data?

- **High Availability**: If one node goes down, others take over.
- **Read Scalability**: Distribute read queries across multiple replicas.
- **Disaster Recovery**: Maintain copies in different data centers or regions.
- **Reduced Latency**: Place replicas closer to users geographically.
- **Backup**: Replicas serve as live backups without impacting the primary.

## Master-Slave (Primary-Replica) Replication

In this topology, one server is designated as the master (primary) and handles all write operations. One or more slave (replica) servers receive copies of the data and serve read queries.

```
  Writes           Reads
    |                |
    v                v
 [Master] -----> [Slave 1]
     |---------> [Slave 2]
     |---------> [Slave 3]
```

### Advantages

- Simple to set up and understand.
- Read queries can be distributed across replicas.
- Slaves can be promoted to master if the master fails.

### Disadvantages

- Single point of failure for writes (until failover occurs).
- Replication lag means slaves may serve stale data.
- Write scalability is limited to a single node.

### PostgreSQL Streaming Replication Example

```bash
# On the primary: configure postgresql.conf
wal_level = replica
max_wal_senders = 3
wal_keep_size = 1GB

# On the primary: create a replication user
psql -c "CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'secret';"

# On the replica: create a base backup
pg_basebackup -h primary_host -D /var/lib/postgresql/data -U replicator -P -R
```

## Master-Master (Multi-Primary) Replication

In this topology, multiple servers can accept write operations. Changes made on any node are replicated to all other nodes.

```
  Writes + Reads     Writes + Reads
       |                  |
       v                  v
   [Node A] <--------> [Node B]
```

### Advantages

- No single point of failure for writes.
- Better write scalability across regions.
- Active-active setup means all nodes are utilized.

### Disadvantages

- Write conflicts can occur when the same data is modified on multiple nodes simultaneously.
- More complex to configure and maintain.
- Conflict resolution strategies are required.

## Synchronous vs Asynchronous Replication

### Synchronous Replication

The primary waits for the replica to confirm that it has received (and optionally written) the data before acknowledging the commit to the client.

```
Client -> Primary: COMMIT
Primary -> Replica: Send WAL
Replica -> Primary: ACK (data received)
Primary -> Client: COMMIT OK
```

- **Pros**: Guarantees zero data loss; replicas are always up to date.
- **Cons**: Higher latency; the primary is blocked if the replica is slow or unreachable.

### Asynchronous Replication

The primary commits the transaction and acknowledges the client immediately. Data is sent to replicas in the background.

```
Client -> Primary: COMMIT
Primary -> Client: COMMIT OK
Primary -> Replica: Send WAL (in background)
```

- **Pros**: Lower latency; the primary is not affected by replica performance.
- **Cons**: Potential data loss if the primary fails before replication completes; replicas may serve stale data.

### Semi-Synchronous Replication

A compromise where the primary waits for at least one replica to acknowledge receipt, but not all replicas.

## Conflict Resolution

In multi-primary setups, conflicts arise when two nodes modify the same data simultaneously. Common resolution strategies:

### Last Write Wins (LWW)

The most recent write (based on timestamp) is accepted. Simple but can lead to data loss.

### Custom Conflict Resolution

Application-level logic determines the correct value.

```javascript
// Example: merge strategy for a shopping cart
function resolveConflict(versionA, versionB) {
    return {
        items: [...new Set([...versionA.items, ...versionB.items])],
        updatedAt: new Date()
    };
}
```

### CRDTs (Conflict-free Replicated Data Types)

Data structures designed to be merged automatically without conflicts. Used by databases like Riak and Redis.

### Vector Clocks

Track causality between events to determine if changes are concurrent or one happened before the other.

## Replication Topologies

| Topology       | Description                                          |
| -------------- | ---------------------------------------------------- |
| Single Leader  | One primary, multiple replicas                       |
| Multi-Leader   | Multiple primaries, each replicating to others       |
| Leaderless     | Any node accepts writes (e.g., Cassandra, DynamoDB) |
| Chain          | Primary -> Replica 1 -> Replica 2 (cascading)       |
| Ring           | Each node replicates to the next in a circular chain |

## Replication Lag

Replication lag is the delay between when data is written on the primary and when it appears on the replica. Common patterns to handle lag:

- **Read-your-writes consistency**: After a write, route the user's subsequent reads to the primary.
- **Monotonic reads**: Ensure a user always reads from the same replica to avoid going back in time.
- **Causal consistency**: If operation B depends on operation A, ensure B is only visible after A.

## Monitoring Replication

```sql
-- PostgreSQL: check replication lag
SELECT client_addr, state,
       pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS lag_bytes
FROM pg_stat_replication;

-- MySQL: check replica status
SHOW REPLICA STATUS\G
-- Look for Seconds_Behind_Source
```

## Resources

- [PostgreSQL Replication Documentation](https://www.postgresql.org/docs/current/high-availability.html)
- [MySQL Replication](https://dev.mysql.com/doc/refman/8.0/en/replication.html)
- [Designing Data-Intensive Applications - Chapter 5](https://dataintensive.net/)
- [CRDTs Explained](https://crdt.tech/)
- [Jepsen - Consistency Testing](https://jepsen.io/)
