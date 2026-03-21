# rkt (Rocket)

rkt (pronounced "rocket") was a container runtime developed by CoreOS as an alternative to Docker. It was designed with a focus on security, composability, and standards compliance. Although rkt is no longer actively maintained, it played an important role in shaping the container ecosystem and driving the creation of open container standards.

## Historical Context

rkt was introduced in December 2014 by CoreOS in response to concerns about Docker's architecture at the time:

- Docker ran as a monolithic daemon with root privileges.
- Container image distribution lacked a formal specification.
- Security and composability were secondary concerns.

CoreOS created rkt to address these issues and also proposed the App Container (appc) specification, which influenced the creation of the Open Container Initiative (OCI).

**Timeline:**

- **2014** — rkt announced by CoreOS.
- **2015** — OCI formed, incorporating ideas from appc.
- **2018** — CoreOS acquired by Red Hat.
- **2020** — rkt archived; project declared end-of-life by CNCF.

## Core Concepts

### Pod-Native Architecture

Unlike Docker, which originally focused on single containers, rkt was pod-native from the start. A pod is a group of containers that share resources and are scheduled together.

```bash
# Run a pod with multiple containers
rkt run \
  docker://nginx \
  docker://fluentd \
  --net=default
```

This concept directly aligned with Kubernetes pods and made rkt a natural fit for Kubernetes deployments.

### Execution Stages

rkt used a three-stage execution model:

```
Stage 0: rkt binary
  → Fetches images, sets up the environment

Stage 1: Execution engine
  → Manages the container runtime (systemd-nspawn, KVM, fly)

Stage 2: Application
  → The actual containerized application
```

This modular design allowed swapping the execution engine without changing the user interface.

## Security Model

rkt was designed with security as a primary concern:

- **No Daemon** — rkt operated without a long-running background daemon. Each container was a self-contained process.
- **Signature Verification** — Images were verified by default using GPG signatures.
- **Privilege Separation** — Different stages ran with different privilege levels.
- **SELinux and Seccomp** — Built-in support for Linux security modules.
- **KVM Stage 1** — Containers could run inside lightweight virtual machines for hardware-level isolation.

```bash
# Fetch with signature verification
rkt fetch --insecure-options=none coreos.com/etcd:v3.3.0

# Run with KVM isolation
rkt run --stage1-name=coreos.com/rkt/stage1-kvm:1.30.0 \
  coreos.com/etcd:v3.3.0
```

## Image Format — App Container (appc)

rkt used the App Container Image (ACI) format:

```json
{
  "acKind": "ImageManifest",
  "acVersion": "0.8.11",
  "name": "example.com/my-app",
  "labels": [
    { "name": "version", "value": "1.0.0" },
    { "name": "os", "value": "linux" },
    { "name": "arch", "value": "amd64" }
  ],
  "app": {
    "exec": ["/bin/my-app"],
    "user": "0",
    "group": "0",
    "ports": [
      { "name": "http", "protocol": "tcp", "port": 8080 }
    ]
  }
}
```

rkt also supported Docker images directly, allowing users to pull from Docker registries.

## rkt vs Docker

| Aspect | rkt | Docker |
|--------|-----|--------|
| Architecture | Daemonless | Central daemon |
| Unit of execution | Pod | Container |
| Image format | ACI + Docker | Docker (OCI) |
| Security | Signature verification by default | Content trust (optional) |
| Init system | systemd integration | Custom init |
| Isolation | systemd-nspawn, KVM, fly | namespaces + cgroups |
| Status | Archived (EOL) | Actively maintained |

## Legacy and Impact

Although rkt is no longer maintained, its contributions are significant:

- **OCI Standards** — rkt and appc influenced the creation of the Open Container Initiative, which standardized container image and runtime specifications.
- **Pod concept** — rkt's pod-native design validated the pod model used by Kubernetes.
- **Security focus** — Pushed the entire ecosystem toward better default security practices.
- **containerd and CRI-O** — Modern container runtimes adopted many of rkt's architectural principles.

## Current Alternatives

For projects that valued rkt's properties, modern alternatives include:

- **containerd** — Industry-standard container runtime used by Docker and Kubernetes.
- **CRI-O** — Lightweight container runtime specifically built for Kubernetes.
- **Podman** — Daemonless container engine with a Docker-compatible CLI.
- **gVisor** — Provides additional sandboxing for container workloads.

## Resources

- [rkt GitHub Repository (Archived)](https://github.com/rkt/rkt)
- [CoreOS — rkt Introduction (Archive)](https://coreos.com/rkt/)
- [App Container Specification](https://github.com/appc/spec)
- [CNCF — rkt Project Archive](https://www.cncf.io/projects/rkt/)
- [Open Container Initiative](https://opencontainers.org/)
