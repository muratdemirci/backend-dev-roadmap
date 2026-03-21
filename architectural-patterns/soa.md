# Service-Oriented Architecture (SOA)

Service-Oriented Architecture (SOA) is an architectural style where application components provide services to other components over a network. SOA promotes reusability, interoperability, and loose coupling through standardized service contracts and communication protocols.

## Core Concepts

- **Service** — A self-contained unit of functionality accessible over a network.
- **Service Contract** — A formal definition of what the service offers, its inputs, outputs, and protocols.
- **Loose Coupling** — Services minimize dependencies on each other.
- **Abstraction** — Services hide internal implementation details.
- **Reusability** — Services are designed to be consumed by multiple clients.
- **Composability** — Services can be combined to build higher-level business processes.

## Enterprise Service Bus (ESB)

The ESB is the central integration backbone in SOA. It handles message routing, transformation, and protocol mediation between services.

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Service A│  │ Service B│  │ Service C│
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │              │
═════╧═════════════╧══════════════╧══════
         Enterprise Service Bus
═════╤═════════════╤══════════════╤══════
     │             │              │
┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐
│ Legacy   │  │ Database │  │ External │
│ System   │  │          │  │ API      │
└──────────┘  └──────────┘  └──────────┘
```

Key ESB responsibilities:

- **Message Routing** — Directs messages to the correct service.
- **Protocol Transformation** — Converts between SOAP, REST, JMS, etc.
- **Message Transformation** — Translates data formats (XML to JSON, etc.).
- **Orchestration** — Coordinates multi-step business processes.
- **Security** — Enforces authentication and authorization policies.

## Service Contracts

SOA relies heavily on formal service contracts, typically defined using WSDL (Web Services Description Language):

```xml
<definitions name="OrderService"
  targetNamespace="http://example.com/orders"
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/">

  <message name="GetOrderRequest">
    <part name="orderId" type="xsd:string"/>
  </message>

  <message name="GetOrderResponse">
    <part name="order" type="tns:Order"/>
  </message>

  <portType name="OrderPortType">
    <operation name="GetOrder">
      <input message="tns:GetOrderRequest"/>
      <output message="tns:GetOrderResponse"/>
    </operation>
  </portType>
</definitions>
```

## Loose Coupling in SOA

Loose coupling is achieved through several mechanisms:

- **Standardized Contracts** — Services interact only through published interfaces.
- **Asynchronous Messaging** — Services communicate via message queues when possible.
- **Service Registry** — A UDDI or similar registry allows dynamic service discovery.
- **Mediation** — The ESB decouples producers from consumers.

## SOA vs Microservices

| Aspect | SOA | Microservices |
|--------|-----|---------------|
| Scope | Enterprise-wide integration | Single application |
| Communication | ESB, SOAP, WS-* | Lightweight REST, gRPC |
| Data | Shared databases common | Database per service |
| Governance | Centralized | Decentralized |
| Service Size | Larger, coarser-grained | Smaller, fine-grained |
| Deployment | Often shared app servers | Independent containers |
| Protocol | SOAP/XML dominant | HTTP/JSON, binary |
| Team Structure | Centralized teams | Small, autonomous teams |

## When to Use SOA

- Large enterprises with many heterogeneous systems that need integration.
- Organizations with significant investment in legacy systems.
- Scenarios requiring formal governance and standardized protocols.
- Business processes that span multiple departments and systems.

## Limitations

- **ESB as a bottleneck** — Centralized bus can become a single point of failure.
- **Complexity** — WS-* standards and XML-heavy contracts add overhead.
- **Slower adoption** — Heavier governance and tooling requirements.
- **Vendor lock-in** — ESB products often tie organizations to specific platforms.

## Resources

- [Thomas Erl — SOA Principles of Service Design](https://www.thomaserl.com/books/)
- [Microsoft — Service-Oriented Architecture](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/)
- [Martin Fowler — Service-Oriented Ambiguity](https://martinfowler.com/bliki/ServiceOrientedAmbiguity.html)
- [IBM — SOA Reference Architecture](https://www.ibm.com/cloud/architecture/architectures/serviceOrientedArchitecture)
