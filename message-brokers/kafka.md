# Apache Kafka

Apache Kafka is a distributed event streaming platform designed for high-throughput, fault-tolerant, and real-time data pipelines. Originally developed at LinkedIn, Kafka is now widely used for building event-driven architectures, log aggregation, and stream processing.

## Core Concepts

- **Broker** — A single Kafka server that stores data and serves clients.
- **Cluster** — A group of brokers working together.
- **Producer** — Publishes messages (records) to topics.
- **Consumer** — Reads messages from topics.
- **ZooKeeper / KRaft** — Manages cluster metadata (KRaft replaces ZooKeeper in newer versions).

## Topics and Partitions

A topic is a named feed of messages. Each topic is split into partitions for parallelism and scalability.

```
Topic: "orders"
├── Partition 0: [msg0, msg1, msg2, msg3, ...]
├── Partition 1: [msg0, msg1, msg2, ...]
└── Partition 2: [msg0, msg1, msg2, msg3, msg4, ...]
```

Key properties:

- Messages within a partition are strictly ordered by offset.
- Each partition is replicated across brokers for fault tolerance.
- A partition has one leader and N-1 followers (replicas).
- Producers choose which partition to write to (via key hash, round-robin, or custom logic).

## Producer Example

```javascript
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: ['localhost:9092', 'localhost:9093']
});

const producer = kafka.producer();

async function publishOrder(order) {
  await producer.connect();

  await producer.send({
    topic: 'orders',
    messages: [
      {
        key: order.userId,           // Ensures same user goes to same partition
        value: JSON.stringify(order),
        headers: { source: 'order-service' }
      }
    ]
  });

  await producer.disconnect();
}
```

## Consumer Groups

Consumers belong to a consumer group. Each partition is assigned to exactly one consumer within a group, enabling parallel processing.

```
Consumer Group: "order-processors"
├── Consumer A → Partition 0, Partition 1
├── Consumer B → Partition 2
└── Consumer C → Partition 3

Consumer Group: "analytics"
├── Consumer D → Partition 0, Partition 1, Partition 2, Partition 3
```

Multiple consumer groups can independently read from the same topic.

```javascript
const consumer = kafka.consumer({ groupId: 'order-processors' });

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const order = JSON.parse(message.value.toString());
      console.log(`Partition ${partition} | Offset ${message.offset}`, order);

      // Processing happens here
      await processOrder(order);
    }
  });
}
```

## Exactly-Once Semantics (EOS)

Kafka supports exactly-once processing through idempotent producers and transactional APIs.

### Idempotent Producer

Prevents duplicate messages caused by producer retries.

```javascript
const producer = kafka.producer({
  idempotent: true,
  maxInFlightRequests: 5
});
```

### Transactions

Atomic read-process-write operations across topics.

```javascript
const producer = kafka.producer({
  idempotent: true,
  transactionalId: 'order-transaction'
});

await producer.connect();

const transaction = await producer.transaction();
try {
  await transaction.send({
    topic: 'processed-orders',
    messages: [{ value: JSON.stringify(processedOrder) }]
  });

  await transaction.sendOffsets({
    consumerGroupId: 'order-processors',
    topics: [{ topic: 'orders', partitions: [{ partition: 0, offset: '42' }] }]
  });

  await transaction.commit();
} catch (err) {
  await transaction.abort();
}
```

## Kafka Streams

Kafka Streams is a client library for building real-time stream processing applications. It processes data directly from Kafka topics.

Key concepts:

- **KStream** — An unbounded stream of records.
- **KTable** — A changelog stream representing the latest value for each key.
- **Windowing** — Grouping events by time windows (tumbling, hopping, session).
- **State Stores** — Local storage for aggregations and joins.

```java
// Java Kafka Streams example
StreamsBuilder builder = new StreamsBuilder();

KStream<String, String> orders = builder.stream("orders");

KTable<String, Long> orderCounts = orders
    .groupByKey()
    .count(Materialized.as("order-counts"));

orderCounts.toStream().to("order-count-results");
```

## Key Configuration

| Config | Default | Description |
|--------|---------|-------------|
| `replication.factor` | 1 | Number of replicas per partition |
| `min.insync.replicas` | 1 | Minimum replicas that must ack a write |
| `retention.ms` | 7 days | How long messages are retained |
| `acks` | 1 | Producer acknowledgment level (0, 1, all) |
| `auto.offset.reset` | latest | Where to start reading (earliest/latest) |

## Resources

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Confluent Kafka Tutorials](https://developer.confluent.io/)
- [Designing Event-Driven Systems — Ben Stopford](https://www.confluent.io/designing-event-driven-systems/)
- [KafkaJS Documentation](https://kafka.js.org/)
- [Kafka Streams Documentation](https://kafka.apache.org/documentation/streams/)
