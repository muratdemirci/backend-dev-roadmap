# Load Shifting

Load shifting is a scaling mitigation strategy that redistributes workload from peak periods to off-peak times. Instead of scaling infrastructure to handle maximum demand, load shifting smooths out traffic spikes by deferring non-urgent work, using queues, and scheduling tasks for less busy periods.

## Core Concept

Most systems experience uneven traffic patterns — bursts during business hours and quiet periods overnight. Load shifting takes advantage of this by moving non-time-sensitive work to off-peak windows.

```
Traffic without load shifting:
  ████████████
  ████████████████
  ████████████████████████  ← Peak (overloaded)
  ████████████████
  ████████████
  ████████

Traffic with load shifting:
  ██████████████
  ██████████████
  ██████████████            ← Peak (manageable)
  ██████████████
  ██████████████
  ██████████████            ← Off-peak (utilized)
```

## Time-Based Traffic Distribution

Schedule heavy operations to run during low-traffic periods.

### Scheduled Jobs

```javascript
const cron = require('node-cron');

// Run heavy report generation at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Generating daily reports...');
  await generateDailyReports();
  await sendReportEmails();
});

// Run database maintenance at 3 AM
cron.schedule('0 3 * * 0', async () => {
  console.log('Running weekly database maintenance...');
  await vacuumDatabase();
  await rebuildIndexes();
});

// Stagger batch operations across off-peak hours
cron.schedule('0 1-5 * * *', async () => {
  const hour = new Date().getHours();
  const batchIndex = hour - 1;
  await processUserBatch(batchIndex);
});
```

### API Rate Limiting by Time

```javascript
function getRateLimit(req) {
  const hour = new Date().getHours();

  // Allow higher rates during off-peak (10 PM - 6 AM)
  if (hour >= 22 || hour < 6) {
    return { windowMs: 60000, max: 200 };
  }

  // Stricter limits during peak hours (9 AM - 5 PM)
  if (hour >= 9 && hour < 17) {
    return { windowMs: 60000, max: 50 };
  }

  // Normal limits otherwise
  return { windowMs: 60000, max: 100 };
}
```

## Queue-Based Processing

Queues decouple request acceptance from processing, allowing work to be handled at a controlled pace.

### Deferring Non-Critical Work

```javascript
const Queue = require('bull');

const emailQueue = new Queue('emails', 'redis://localhost:6379');
const reportQueue = new Queue('reports', 'redis://localhost:6379');

// API endpoint — accepts request immediately, defers processing
app.post('/api/orders', async (req, res) => {
  const order = await createOrder(req.body);

  // Defer non-critical work to queues
  await emailQueue.add('order-confirmation', {
    orderId: order.id,
    email: req.body.email
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 }
  });

  await reportQueue.add('update-analytics', {
    orderId: order.id,
    total: order.total
  }, {
    delay: 300000  // Delay by 5 minutes
  });

  res.status(201).json(order);
});

// Worker processes jobs at a controlled rate
emailQueue.process('order-confirmation', 5, async (job) => {
  await sendOrderConfirmation(job.data.orderId, job.data.email);
});
```

### Priority Queues

```javascript
// High-priority tasks processed first
await taskQueue.add('process', criticalData, { priority: 1 });

// Low-priority tasks shifted to when capacity is available
await taskQueue.add('process', bulkData, { priority: 10 });

// Schedule bulk work for off-peak
const offPeakDelay = calculateDelayUntilOffPeak();
await taskQueue.add('bulk-import', largeDataset, {
  delay: offPeakDelay,
  priority: 20
});
```

## Off-Peak Processing Patterns

### Batch Processing Window

```javascript
class BatchProcessor {
  constructor(queue) {
    this.queue = queue;
    this.isOffPeak = false;
  }

  checkOffPeak() {
    const hour = new Date().getHours();
    this.isOffPeak = (hour >= 22 || hour < 6);
  }

  async processBatch() {
    this.checkOffPeak();

    if (this.isOffPeak) {
      // Process larger batches during off-peak
      const jobs = await this.queue.getWaiting(0, 100);
      await Promise.all(jobs.map(job => this.process(job)));
    } else {
      // Process smaller batches during peak
      const jobs = await this.queue.getWaiting(0, 10);
      for (const job of jobs) {
        await this.process(job);
        await sleep(100); // Throttle during peak
      }
    }
  }
}
```

### Database Write Buffering

```javascript
class WriteBuffer {
  constructor(flushInterval = 5000) {
    this.buffer = [];
    this.flushInterval = flushInterval;

    setInterval(() => this.flush(), this.flushInterval);
  }

  add(record) {
    this.buffer.push(record);
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.splice(0, this.buffer.length);
    await db.collection('analytics').insertMany(batch);
  }
}
```

## Common Use Cases

| Scenario | Strategy |
|----------|----------|
| Email notifications | Queue and send in batches |
| Report generation | Schedule during off-peak hours |
| Data exports | Queue and process overnight |
| Search index rebuilding | Incremental updates off-peak |
| Database maintenance | Scheduled maintenance windows |
| Bulk API calls to third parties | Spread across low-traffic periods |

## Benefits

- Reduces peak infrastructure requirements and costs.
- Prevents system overload during traffic spikes.
- Improves response times for real-time requests.
- Makes better use of existing infrastructure capacity.

## Limitations

- Adds latency to deferred operations.
- Requires careful monitoring of queue depth and processing lag.
- Not suitable for operations that require immediate results.
- Adds complexity to the system architecture.

## Resources

- [Bull Queue Documentation](https://docs.bullmq.io/)
- [AWS SQS — Delay Queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-delay-queues.html)
- [Martin Fowler — Queue-Based Load Leveling](https://docs.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling)
- [Node-cron Documentation](https://github.com/node-cron/node-cron)
