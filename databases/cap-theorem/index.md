# CAP Theorem

The CAP theorem, also known as Brewer's theorem, states that a distributed data store can provide at most two out of three guarantees simultaneously: Consistency, Availability, and Partition Tolerance. Formulated by Eric Brewer in 2000 and formally proved by Seth Gilbert and Nancy Lynch in 2002, the CAP theorem is a foundational concept for understanding the trade-offs in distributed systems.

## The Three Properties

### Consistency (C)

Every read receives the most recent write or an error. All nodes in the system see the same data at the same time. This is linearizable consistency, the strongest form.

```
Client writes X=5 to Node A
Client reads X from Node B -> must return 5 (or an error)
```

### Availability (A)

Every request receives a non-error response, without the guarantee that it contains the most recent write. The system continues to operate and serve requests even if some data is stale.

```
Client reads X from Node B -> always returns a value (may be stale)
```

### Partition Tolerance (P)

The system continues to operate despite network partitions (communication breakdowns between nodes). Messages between nodes can be lost or delayed indefinitely.

```
[Node A] ---X--- [Node B]   (network partition)
Both nodes must still handle requests
```

## Why You Cannot Have All Three

In a distributed system, network partitions are inevitable. When a partition occurs, the system must choose between:

- **Consistency**: Stop serving requests on the partitioned side (sacrifice availability) to ensure all responses are correct.
- **Availability**: Continue serving requests on both sides (sacrifice consistency) even though the nodes cannot communicate.

Since partitions cannot be prevented in real networks, the practical choice is between **CP** and **AP**.

```
           Consistency
              /\
             /  \
            /    \
           / CP   \
          /________\
         /\   CAP  /\
        /  \ (not  / \
       / AP \poss)/ CA\
      /______\  /______\
  Availability  Partition
                Tolerance

  CA = Only possible in non-distributed (single node) systems
  CP = Consistent + Partition Tolerant (may reject requests)
  AP = Available + Partition Tolerant (may serve stale data)
```

## CP Systems

CP systems prioritize consistency over availability. During a network partition, the system may refuse to respond rather than return potentially inconsistent data.

### Examples

- **MongoDB** (with majority write concern): Writes are acknowledged only when replicated to a majority of nodes. During a partition, the minority side cannot accept writes.
- **HBase**: Strong consistency model built on top of HDFS. Unavailable during region server failures until recovery.
- **Redis Cluster** (with WAIT): Can be configured to wait for replicas before acknowledging writes.
- **Zookeeper**: Used for distributed coordination where correctness is more important than availability.

### When to Choose CP

- Financial transactions where incorrect data is unacceptable.
- Inventory systems where overselling must be prevented.
- Distributed locking and leader election.

## AP Systems

AP systems prioritize availability over consistency. During a network partition, all nodes continue to accept requests, but some may return stale data.

### Examples

- **Cassandra**: Tunable consistency, but commonly used in AP mode with eventual consistency.
- **DynamoDB**: Designed for high availability with eventual consistency as the default.
- **CouchDB**: Multi-master replication with eventual consistency and conflict resolution.
- **DNS**: The Domain Name System is a classic AP system; changes propagate gradually.

### When to Choose AP

- Social media feeds where slight staleness is acceptable.
- Shopping carts that should always be available.
- Analytics and logging where losing a few data points is tolerable.
- Content delivery where availability trumps freshness.

## Real-World Trade-offs

The CAP theorem is not a binary choice. Modern systems offer tunable consistency that lets you adjust the trade-off per operation:

### Cassandra Example

```cql
-- Strong consistency (quorum reads + quorum writes)
-- R + W > N ensures consistency
INSERT INTO users (id, name) VALUES (1, 'Alice')
    USING CONSISTENCY QUORUM;

SELECT * FROM users WHERE id = 1
    USING CONSISTENCY QUORUM;

-- High availability (ONE read/write)
INSERT INTO users (id, name) VALUES (1, 'Alice')
    USING CONSISTENCY ONE;

SELECT * FROM users WHERE id = 1
    USING CONSISTENCY ONE;
```

### DynamoDB Example

```javascript
// Eventually consistent read (default, higher availability)
const result = await docClient.get({
    TableName: 'Users',
    Key: { id: '001' }
}).promise();

// Strongly consistent read (may be slower, higher consistency)
const result = await docClient.get({
    TableName: 'Users',
    Key: { id: '001' },
    ConsistentRead: true
}).promise();
```

## PACELC: Beyond CAP

The PACELC theorem extends CAP by considering behavior when there is no partition:

- **If Partition (P)**: Choose between Availability (A) and Consistency (C).
- **Else (E)**: Choose between Latency (L) and Consistency (C).

| System     | During Partition (PAC) | Normal Operation (ELC) |
| ---------- | ---------------------- | ---------------------- |
| DynamoDB   | PA                     | EL                     |
| Cassandra  | PA                     | EL                     |
| MongoDB    | PC                     | EC                     |
| HBase      | PC                     | EC                     |
| PostgreSQL | PC                     | EC                     |

## Common Misconceptions

- **"You must pick exactly two"**: In practice, systems offer a spectrum, not a binary choice.
- **"CA systems exist in distributed environments"**: Network partitions are unavoidable; CA only works on a single node.
- **"CAP applies only to databases"**: It applies to any distributed system, including caches, message queues, and microservices.
- **"Consistency in CAP = ACID consistency"**: CAP consistency means linearizability, which is different from ACID's consistency guarantees.

## Resources

- [Brewer's CAP Theorem (Original Paper)](https://people.eecs.berkeley.edu/~brewer/cs262b-2004/PODC-keynote.pdf)
- [CAP Twelve Years Later - Eric Brewer](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)
- [Designing Data-Intensive Applications - Chapter 9](https://dataintensive.net/)
- [Please Stop Calling Databases CP or AP](https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html)
- [Jepsen - Distributed Systems Consistency](https://jepsen.io/)
