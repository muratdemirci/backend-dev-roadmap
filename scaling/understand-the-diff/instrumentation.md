# Instrumentation

Instrumentation is the practice of adding code-level measurement points to your application to collect metrics, traces, and logs. It provides visibility into how your system behaves in production, enabling you to detect performance bottlenecks, diagnose failures, and make informed scaling decisions.

## Core Concepts

- **Metrics** — Numerical measurements collected over time (e.g., request count, latency, CPU usage).
- **Traces** — End-to-end records of a request as it flows through services.
- **Logs** — Structured event records emitted by the application.
- **Spans** — Individual units of work within a trace (e.g., a database query, an HTTP call).

These three pillars — metrics, traces, and logs — form the foundation of observability.

## OpenTelemetry SDK

OpenTelemetry (OTel) is the industry-standard framework for instrumentation. It provides a single set of APIs and SDKs for collecting metrics, traces, and logs.

### Setup

```javascript
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  serviceName: 'my-api',
  traceExporter: new OTLPTraceExporter({
    url: 'http://collector:4318/v1/traces',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://collector:4318/v1/metrics',
    }),
    exportIntervalMillis: 15000,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

Auto-instrumentation automatically captures spans for common libraries (HTTP, Express, database drivers, etc.) without modifying application code.

## Custom Metrics

Define application-specific metrics that reflect business and performance concerns.

```javascript
const { metrics } = require('@opentelemetry/api');

const meter = metrics.getMeter('my-api');

// Counter — tracks cumulative values
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
});

// Histogram — tracks distribution of values
const responseTime = meter.createHistogram('http_response_time_ms', {
  description: 'HTTP response time in milliseconds',
  unit: 'ms',
});

// Up/Down Counter — tracks values that go up and down
const activeConnections = meter.createUpDownCounter('active_connections', {
  description: 'Number of active connections',
});

// Middleware to record metrics
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  activeConnections.add(1);

  res.on('finish', () => {
    const duration = Date.now() - start;

    requestCounter.add(1, {
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode,
    });

    responseTime.record(duration, {
      method: req.method,
      path: req.route?.path || req.path,
    });

    activeConnections.add(-1);
  });

  next();
}
```

## Custom Tracing

Add manual spans to trace specific operations within your application.

```javascript
const { trace, SpanStatusCode } = require('@opentelemetry/api');

const tracer = trace.getTracer('my-api');

async function processOrder(orderId) {
  return tracer.startActiveSpan('processOrder', async (span) => {
    try {
      span.setAttribute('order.id', orderId);

      // Nested span for database query
      const order = await tracer.startActiveSpan('db.findOrder', async (dbSpan) => {
        dbSpan.setAttribute('db.system', 'postgresql');
        dbSpan.setAttribute('db.statement', 'SELECT * FROM orders WHERE id = $1');
        const result = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        dbSpan.end();
        return result.rows[0];
      });

      // Nested span for external API call
      await tracer.startActiveSpan('payment.charge', async (paySpan) => {
        paySpan.setAttribute('payment.amount', order.total);
        await paymentService.charge(order);
        paySpan.end();
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return order;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

## Structured Logging with Trace Context

Connect logs to traces for correlated debugging.

```javascript
const { trace } = require('@opentelemetry/api');
const pino = require('pino');

const logger = pino({ level: 'info' });

function log(level, message, extra = {}) {
  const span = trace.getActiveSpan();
  const traceContext = span ? {
    traceId: span.spanContext().traceId,
    spanId: span.spanContext().spanId,
  } : {};

  logger[level]({ ...extra, ...traceContext }, message);
}

// Usage
log('info', 'Order processed', { orderId: '123', total: 49.99 });
```

## Key Metrics to Instrument

| Category | Metrics |
|----------|---------|
| HTTP | Request rate, response time (p50/p95/p99), error rate |
| Database | Query duration, connection pool usage, slow queries |
| Queue | Enqueue/dequeue rate, queue depth, processing time |
| Cache | Hit/miss ratio, eviction count, latency |
| Business | Orders per minute, sign-ups, failed payments |
| System | CPU, memory, disk I/O, network |

## Exporters and Backends

OpenTelemetry data can be exported to various observability backends:

| Backend | Metrics | Traces | Logs |
|---------|---------|--------|------|
| Prometheus + Grafana | Yes | No | No |
| Jaeger | No | Yes | No |
| Datadog | Yes | Yes | Yes |
| Grafana Tempo | No | Yes | No |
| Elastic APM | Yes | Yes | Yes |

## Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [OpenTelemetry JavaScript SDK](https://opentelemetry.io/docs/instrumentation/js/)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/docs/)
- [Google SRE Book — Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/)
