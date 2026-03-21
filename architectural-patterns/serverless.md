# Serverless Architecture

Serverless architecture is a cloud computing model where the cloud provider dynamically manages the allocation and provisioning of servers. Developers write functions that run in stateless containers, triggered by events, without managing the underlying infrastructure.

## Core Concepts

- **Function as a Service (FaaS)** — Individual functions deployed and executed independently.
- **Backend as a Service (BaaS)** — Managed services for databases, authentication, storage, etc.
- **Event-Driven** — Functions are triggered by events (HTTP requests, queue messages, file uploads).
- **Pay-Per-Use** — Billing is based on actual execution time and resource consumption.
- **Stateless** — Each function invocation is independent with no shared state.

## Function as a Service (FaaS)

FaaS is the core of serverless. You write small, single-purpose functions that the platform runs on demand.

### AWS Lambda Example

```javascript
// handler.js — AWS Lambda function
exports.handler = async (event) => {
  const { name } = JSON.parse(event.body);

  const greeting = `Hello, ${name}!`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: greeting })
  };
};
```

### Azure Functions Example

```javascript
// index.js — Azure Function
module.exports = async function (context, req) {
  const name = req.query.name || (req.body && req.body.name);

  context.res = {
    status: 200,
    body: { message: `Hello, ${name}!` }
  };
};
```

## Cold Starts

A cold start occurs when a function is invoked after being idle. The platform must allocate a container, load the runtime, and initialize the function code.

**Factors affecting cold start duration:**

- **Runtime** — Go and Rust have fast cold starts; Java and .NET are slower.
- **Package size** — Larger deployment packages increase initialization time.
- **VPC configuration** — Functions inside a VPC may experience additional network setup delay.
- **Memory allocation** — More allocated memory also means more CPU, which speeds up initialization.

**Mitigation strategies:**

- Keep function packages small and dependencies minimal.
- Use provisioned concurrency (AWS) or pre-warmed instances (Azure).
- Choose lightweight runtimes when latency is critical.
- Avoid placing functions in a VPC unless necessary.

## Deployment with Serverless Framework

```yaml
# serverless.yml
service: my-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  memorySize: 256
  timeout: 10

functions:
  createUser:
    handler: src/handlers/user.create
    events:
      - http:
          path: /users
          method: post

  processOrder:
    handler: src/handlers/order.process
    events:
      - sqs:
          arn: !GetAtt OrderQueue.Arn
          batchSize: 10
```

## Common Triggers

| Trigger | Example Use Case |
|---------|-----------------|
| HTTP Request | REST API endpoints |
| Queue Message | Asynchronous task processing |
| File Upload (S3) | Image processing, data import |
| Database Change | Real-time data synchronization |
| Scheduled (Cron) | Periodic reports, cleanup jobs |
| IoT Event | Device data processing |

## Advantages

- **No server management** — Focus entirely on business logic.
- **Automatic scaling** — Scales from zero to thousands of concurrent executions.
- **Cost efficiency** — No charges when functions are idle.
- **Faster time to market** — Less infrastructure to configure and maintain.

## Disadvantages

- **Cold starts** — Latency on first invocation after idle period.
- **Vendor lock-in** — Functions are tightly coupled to provider APIs and services.
- **Execution limits** — Maximum execution time (e.g., 15 minutes on AWS Lambda).
- **Debugging difficulty** — Distributed, ephemeral functions are harder to trace.
- **State management** — Stateless nature requires external storage for any persistent data.

## Major Providers

| Provider | Service | Max Timeout |
|----------|---------|-------------|
| AWS | Lambda | 15 minutes |
| Azure | Functions | 10 minutes (Consumption) |
| Google Cloud | Cloud Functions | 9 minutes |
| Cloudflare | Workers | 30 seconds (free) |

## Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [Serverless Framework](https://www.serverless.com/framework/docs/)
- [Martin Fowler — Serverless](https://martinfowler.com/articles/serverless.html)
- [The CNCF Serverless Whitepaper](https://github.com/cncf/wg-serverless/blob/main/whitepapers/serverless-overview/README.md)
