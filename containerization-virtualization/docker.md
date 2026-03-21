# Docker

Docker is a platform for building, shipping, and running applications inside lightweight, portable containers. Containers package an application with its dependencies and runtime environment, ensuring consistency across development, testing, and production.

## Core Concepts

- **Image** — A read-only template containing the application, dependencies, and filesystem.
- **Container** — A running instance of an image, isolated from the host and other containers.
- **Registry** — A storage and distribution system for images (e.g., Docker Hub, GitHub Container Registry).
- **Daemon** — The background process that manages containers, images, volumes, and networks.

## Images

Images are built in layers. Each instruction in a Dockerfile creates a new layer that is cached and reused.

```bash
# Pull an image
docker pull node:18-alpine

# List local images
docker images

# Remove an image
docker rmi node:18-alpine
```

## Dockerfile

A Dockerfile defines how to build an image.

```dockerfile
# Multi-stage build for a Node.js application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]
```

Key instructions:

| Instruction | Purpose |
|-------------|---------|
| `FROM` | Base image |
| `WORKDIR` | Set working directory |
| `COPY` / `ADD` | Copy files into the image |
| `RUN` | Execute commands during build |
| `EXPOSE` | Document which port the app uses |
| `CMD` | Default command when container starts |
| `ENTRYPOINT` | Fixed executable for the container |
| `ENV` | Set environment variables |

## Container Lifecycle

```bash
# Create and start a container
docker run -d --name my-app -p 3000:3000 my-image:latest

# List running containers
docker ps

# Stop, start, restart
docker stop my-app
docker start my-app
docker restart my-app

# View logs
docker logs -f my-app

# Execute a command inside a running container
docker exec -it my-app sh

# Remove a container
docker rm my-app
```

## Volumes

Volumes persist data beyond the container lifecycle and share data between containers.

```bash
# Named volume
docker run -v app-data:/app/data my-image

# Bind mount (host directory)
docker run -v $(pwd)/config:/app/config:ro my-image

# Create and inspect volumes
docker volume create my-data
docker volume inspect my-data
```

## Networking

Docker provides several network drivers:

- **bridge** — Default. Containers on the same bridge can communicate by name.
- **host** — Container shares the host network stack.
- **none** — No networking.
- **overlay** — Multi-host networking for Swarm.

```bash
# Create a custom network
docker network create my-network

# Run containers on the same network
docker run -d --name api --network my-network api-image
docker run -d --name db --network my-network postgres:15

# Inside 'api' container, 'db' resolves to the postgres container
```

## Docker Compose

Compose defines multi-container applications in a single YAML file.

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    image: postgres:15-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb

  cache:
    image: redis:7-alpine

volumes:
  pgdata:
```

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f api

# Stop and remove
docker compose down

# Rebuild and restart
docker compose up -d --build
```

## Best Practices

- Use multi-stage builds to keep images small.
- Use `.dockerignore` to exclude unnecessary files.
- Run processes as a non-root user.
- Pin specific image versions instead of `latest`.
- Combine `RUN` commands to reduce layer count.
- Order Dockerfile instructions from least to most frequently changed for better caching.

## Resources

- [Docker Official Documentation](https://docs.docker.com/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Hub](https://hub.docker.com/)
