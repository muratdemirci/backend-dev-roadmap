# LXC (Linux Containers)

LXC (Linux Containers) is an OS-level virtualization method for running multiple isolated Linux systems on a single host. Unlike full virtual machines, LXC containers share the host kernel while providing process, network, and filesystem isolation through Linux kernel features.

## Core Concepts

LXC provides system-level containers that behave like lightweight virtual machines. Each container runs a full Linux distribution with its own init system, users, and filesystem.

- **System Containers** — Run a full OS environment (like a VM but without a hypervisor).
- **Shared Kernel** — All containers use the host Linux kernel.
- **Near-Native Performance** — No hardware emulation overhead.

## Linux Kernel Features

LXC relies on two core kernel features: namespaces and cgroups.

### Namespaces

Namespaces provide isolation by giving each container its own view of system resources.

| Namespace | Isolates |
|-----------|----------|
| `pid` | Process IDs — container sees its own PID 1 |
| `net` | Network interfaces, IPs, routing tables |
| `mnt` | Mount points and filesystem |
| `uts` | Hostname and domain name |
| `ipc` | Inter-process communication (shared memory, semaphores) |
| `user` | User and group IDs |
| `cgroup` | Cgroup root directory |

### Control Groups (cgroups)

Cgroups limit and monitor resource usage for container processes.

```bash
# View cgroup limits for a container
cat /sys/fs/cgroup/memory/lxc/my-container/memory.limit_in_bytes
cat /sys/fs/cgroup/cpu/lxc/my-container/cpu.shares
```

Resources controlled by cgroups:

- **CPU** — CPU time allocation and pinning.
- **Memory** — RAM and swap limits.
- **Block I/O** — Disk read/write bandwidth.
- **Network** — Traffic prioritization via `tc`.
- **PIDs** — Maximum number of processes.

## Working with LXC

### Creating and Managing Containers

```bash
# Create a container from a template
lxc-create -n my-container -t ubuntu -- --release focal

# Start, stop, and manage
lxc-start -n my-container
lxc-stop -n my-container
lxc-restart -n my-container

# List running containers
lxc-ls --fancy

# Attach to a running container
lxc-attach -n my-container

# Destroy a container
lxc-destroy -n my-container
```

### Container Configuration

LXC containers are configured via files in `/var/lib/lxc/<name>/config`.

```ini
# /var/lib/lxc/my-container/config
lxc.include = /usr/share/lxc/config/ubuntu.common.conf

# Network configuration
lxc.net.0.type = veth
lxc.net.0.link = lxcbr0
lxc.net.0.flags = up
lxc.net.0.hwaddr = 00:16:3e:xx:xx:xx
lxc.net.0.ipv4.address = 10.0.3.100/24

# Resource limits
lxc.cgroup2.memory.max = 512M
lxc.cgroup2.cpu.max = 100000 200000

# Filesystem
lxc.rootfs.path = dir:/var/lib/lxc/my-container/rootfs

# Security
lxc.apparmor.profile = generated
lxc.cap.drop = sys_admin
```

## LXD — The Modern LXC Experience

LXD is a system container and virtual machine manager built on top of LXC, providing a better user experience.

```bash
# Initialize LXD
lxd init

# Launch a container
lxc launch ubuntu:22.04 my-container

# List containers
lxc list

# Execute commands
lxc exec my-container -- apt update

# Resource limits
lxc config set my-container limits.memory 512MB
lxc config set my-container limits.cpu 2

# Snapshots
lxc snapshot my-container snap0
lxc restore my-container snap0

# File transfer
lxc file push local-file.txt my-container/tmp/
lxc file pull my-container/var/log/syslog .
```

## LXC vs Docker

| Aspect | LXC | Docker |
|--------|-----|--------|
| Type | System containers | Application containers |
| Init system | Full init (systemd) | Single process |
| Purpose | Lightweight VM replacement | Package and ship applications |
| Image format | OS templates | Layered images (OCI) |
| Networking | Bridge, macvlan, physical | Bridge, host, overlay |
| Storage | Directory, ZFS, Btrfs, LVM | Union filesystems (overlay2) |
| Orchestration | Limited | Docker Swarm, Kubernetes |
| Use case | Running full OS environments | Running microservices |
| Lifecycle | Long-lived | Ephemeral |

## When to Use LXC

- Running multiple isolated Linux environments on a single host.
- Replacing traditional VMs where full hardware virtualization is unnecessary.
- Development environments that need a full OS stack.
- Multi-tenant hosting where each tenant needs an isolated OS.
- CI/CD pipelines that need system-level isolation.

## Security Considerations

- **Unprivileged containers** — Run containers mapped to non-root user IDs on the host. This is the recommended approach.
- **AppArmor / SELinux** — Mandatory access control profiles restrict container capabilities.
- **Seccomp** — System call filtering limits what containers can do.
- **Capability dropping** — Remove unnecessary Linux capabilities from containers.

```bash
# Create an unprivileged container
lxc-create -n secure-container -t download -- -d ubuntu -r focal -a amd64
```

## Resources

- [LXC Official Documentation](https://linuxcontainers.org/lxc/)
- [LXD Documentation](https://documentation.ubuntu.com/lxd/)
- [Linux Namespaces — man7.org](https://man7.org/linux/man-pages/man7/namespaces.7.html)
- [cgroups — Kernel Documentation](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html)
- [Canonical LXD](https://canonical.com/lxd)
