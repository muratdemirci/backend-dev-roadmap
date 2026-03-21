# RabbitMQ

RabbitMQ is an open-source message broker that implements the Advanced Message Queuing Protocol (AMQP). It enables applications to communicate asynchronously by sending messages through exchanges and queues, providing reliable message delivery, flexible routing, and high availability.

## AMQP Protocol

AMQP (Advanced Message Queuing Protocol) is the wire-level protocol that RabbitMQ implements. Key concepts:

- **Producer** — Sends messages to an exchange.
- **Exchange** — Routes messages to queues based on rules (bindings).
- **Queue** — Stores messages until consumed.
- **Consumer** — Receives and processes messages from a queue.
- **Binding** — A rule that links an exchange to a queue with a routing key.

```
Producer → Exchange → Binding → Queue → Consumer
```

## Exchange Types

### Direct Exchange

Routes messages to queues whose binding key exactly matches the routing key.

```javascript
// Publisher
channel.assertExchange('direct_logs', 'direct', { durable: true });
channel.publish('direct_logs', 'error', Buffer.from('Disk full'));

// Consumer
channel.assertQueue('error_queue', { durable: true });
channel.bindQueue('error_queue', 'direct_logs', 'error');
```

### Fanout Exchange

Broadcasts messages to all bound queues regardless of routing key.

```javascript
channel.assertExchange('notifications', 'fanout', { durable: true });
channel.publish('notifications', '', Buffer.from('System update available'));
```

### Topic Exchange

Routes messages to queues based on wildcard pattern matching on the routing key.

```javascript
// Binding with wildcards: * matches one word, # matches zero or more
channel.bindQueue('all_orders', 'orders_topic', 'order.#');
channel.bindQueue('us_orders', 'orders_topic', 'order.us.*');

// Publish
channel.publish('orders_topic', 'order.us.created', Buffer.from(data));
```

### Headers Exchange

Routes based on message header attributes instead of the routing key.

## Complete Producer/Consumer Example

```javascript
const amqp = require('amqplib');

// Producer
async function sendMessage() {
  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();

  const queue = 'task_queue';
  await channel.assertQueue(queue, { durable: true });

  const message = JSON.stringify({ taskId: 1, action: 'process_image' });
  channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

  console.log('Sent:', message);
  await channel.close();
  await conn.close();
}

// Consumer
async function consumeMessages() {
  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();

  const queue = 'task_queue';
  await channel.assertQueue(queue, { durable: true });
  channel.prefetch(1); // Process one message at a time

  channel.consume(queue, (msg) => {
    const content = JSON.parse(msg.content.toString());
    console.log('Received:', content);

    // Acknowledge after processing
    channel.ack(msg);
  });
}
```

## Prefetch (Quality of Service)

Prefetch controls how many unacknowledged messages a consumer can hold. This prevents fast producers from overwhelming slow consumers.

```javascript
// Consumer receives at most 10 unacknowledged messages
channel.prefetch(10);

// Global prefetch — shared across all consumers on this channel
channel.prefetch(10, true);
```

## Dead Letter Exchange (DLX)

When a message is rejected, expires, or a queue exceeds its max length, RabbitMQ can route it to a Dead Letter Exchange for inspection or retry.

```javascript
// Queue with dead letter configuration
await channel.assertQueue('main_queue', {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': 'dlx_exchange',
    'x-dead-letter-routing-key': 'failed',
    'x-message-ttl': 30000  // 30 seconds TTL
  }
});

// Dead letter queue
await channel.assertExchange('dlx_exchange', 'direct', { durable: true });
await channel.assertQueue('dead_letter_queue', { durable: true });
await channel.bindQueue('dead_letter_queue', 'dlx_exchange', 'failed');
```

## Message Durability

- **Durable queues** — Survive broker restart (`durable: true`).
- **Persistent messages** — Written to disk (`persistent: true`).
- **Publisher confirms** — Broker acknowledges receipt of messages.

## High Availability

- **Quorum Queues** — Raft-based replicated queues (recommended for HA).
- **Classic Mirrored Queues** — Legacy HA approach (deprecated in favor of quorum queues).
- **Clustering** — Multiple nodes form a cluster sharing metadata and topology.

## Resources

- [RabbitMQ Official Documentation](https://www.rabbitmq.com/documentation.html)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [AMQP 0-9-1 Specification](https://www.amqp.org/)
- [CloudAMQP — RabbitMQ Best Practices](https://www.cloudamqp.com/blog/part1-rabbitmq-best-practice.html)
