# Horizontal vs Vertical Scaling

Scaling is the ability to handle increased load by adding resources to your system. There are two fundamental approaches: vertical scaling (scaling up) adds more power to existing machines, while horizontal scaling (scaling out) adds more machines to distribute the load.

## Vertical Scaling (Scaling Up)

Vertical scaling increases the capacity of a single server by adding more CPU, RAM, storage, or upgrading to faster hardware.

```
Before:  [Server: 4 CPU, 8 GB RAM]
After:   [Server: 16 CPU, 64 GB RAM]
```

### Advantages

- **Simple** — No changes to application architecture or code.
- **No distribution complexity** — Single server means no data synchronization or networking concerns.
- **Strong consistency** — All data lives on one machine.
- **Lower operational overhead** — One server to monitor and maintain.

### Disadvantages

- **Hardware limits** — There is a ceiling on how much you can upgrade a single machine.
- **Single point of failure** — If the server goes down, everything goes down.
- **Expensive** — High-end hardware costs grow exponentially.
- **Downtime during upgrades** — Hardware changes often require restarts.

### When to Use

- Small to medium applications where current hardware can handle projected growth.
- Databases that benefit from single-node performance (e.g., vertical scaling a PostgreSQL instance).
- Applications that are difficult to distribute (e.g., tightly coupled stateful systems).
- Early-stage projects where simplicity is a priority.

## Horizontal Scaling (Scaling Out)

Horizontal scaling adds more machines (instances) and distributes the workload across them.

```
Before:  [Server A]
After:   [Server A] [Server B] [Server C] [Server D]
              └─────────┴──────────┴─────────┘
                      Load Balancer
```

### Advantages

- **Near-unlimited scaling** — Add more machines as demand grows.
- **Fault tolerance** — If one instance fails, others continue serving traffic.
- **Cost efficient** — Use many commodity servers instead of expensive high-end hardware.
- **Incremental** — Add capacity gradually as needed.

### Disadvantages

- **Application complexity** — Code must be stateless or handle distributed state.
- **Data consistency** — Distributed data requires synchronization strategies.
- **Network overhead** — Inter-node communication adds latency.
- **Operational complexity** — More servers to deploy, monitor, and manage.

### When to Use

- Web applications with stateless request handling.
- Systems expecting significant traffic growth.
- Applications that require high availability and fault tolerance.
- Microservices architectures where services can scale independently.

## Comparison

| Aspect | Vertical | Horizontal |
|--------|----------|------------|
| Method | Bigger machine | More machines |
| Cost curve | Exponential | Linear |
| Scaling limit | Hardware ceiling | Virtually unlimited |
| Complexity | Low | Higher |
| Downtime | Often required | Zero-downtime possible |
| Fault tolerance | Single point of failure | Built-in redundancy |
| Data consistency | Simple | Requires coordination |
| Best for | Databases, stateful apps | Stateless web services |

## Auto-Scaling

Auto-scaling automatically adjusts the number of instances based on real-time demand. It is a key feature of horizontal scaling in cloud environments.

### AWS Auto Scaling Group

```yaml
# CloudFormation Auto Scaling configuration
AutoScalingGroup:
  Type: AWS::AutoScaling::AutoScalingGroup
  Properties:
    LaunchTemplate:
      LaunchTemplateId: !Ref LaunchTemplate
      Version: !GetAtt LaunchTemplate.LatestVersionNumber
    MinSize: 2
    MaxSize: 10
    DesiredCapacity: 3
    TargetGroupARNs:
      - !Ref ALBTargetGroup
    HealthCheckType: ELB
    HealthCheckGracePeriod: 300

ScaleUpPolicy:
  Type: AWS::AutoScaling::ScalingPolicy
  Properties:
    AutoScalingGroupName: !Ref AutoScalingGroup
    PolicyType: TargetTrackingScaling
    TargetTrackingConfiguration:
      PredefinedMetricSpecification:
        PredefinedMetricType: ASGAverageCPUUtilization
      TargetValue: 70.0
```

### Kubernetes Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 4
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 25
          periodSeconds: 120
```

## Making Applications Horizontally Scalable

Key requirements for applications that scale horizontally:

- **Stateless design** — Store session data in external stores (Redis, database) instead of local memory.
- **Shared storage** — Use centralized storage (S3, NFS) for files instead of local disk.
- **Externalized configuration** — Use environment variables or config services.
- **Idempotent operations** — Requests can be safely retried if routed to a different instance.

```javascript
// Stateless session using Redis
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

const redisClient = createClient({ url: 'redis://redis:6379' });
redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
```

## Combining Both Approaches

In practice, most systems use both strategies. Scale vertically first for simplicity, then add horizontal scaling when you approach hardware limits or need high availability.

```
[Load Balancer]
       |
  ┌────┼────┐
  │    │    │
[8CPU][8CPU][8CPU]   ← Horizontal (3 instances)
64GB  64GB  64GB     ← Vertical (each is powerful)
```

## Resources

- [AWS Auto Scaling](https://docs.aws.amazon.com/autoscaling/)
- [Kubernetes HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Google SRE — Managing Load](https://sre.google/sre-book/handling-overload/)
- [Martin Fowler — Scalability](https://martinfowler.com/articles/patterns-of-distributed-systems/)
