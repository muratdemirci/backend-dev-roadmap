# Nginx

Nginx (pronounced "engine-x") is a high-performance HTTP server, reverse proxy, and load balancer. Known for its event-driven, non-blocking architecture, Nginx handles thousands of concurrent connections with minimal memory usage. It is one of the most widely deployed web servers in the world.

## Core Architecture

Nginx uses an asynchronous, event-driven model:

- **Master Process** — Reads configuration, manages worker processes.
- **Worker Processes** — Handle client connections using an event loop (epoll/kqueue).
- **Non-Blocking I/O** — A single worker can handle thousands of concurrent connections.

## Configuration Structure

Nginx configuration lives in `/etc/nginx/nginx.conf` and follows a hierarchical block structure.

```nginx
# Main context
worker_processes auto;
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log  /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    # Include site configurations
    include /etc/nginx/conf.d/*.conf;
}
```

## Serving Static Files

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

## Reverse Proxy

Nginx proxies client requests to backend application servers.

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Load Balancing

Nginx distributes traffic across multiple backend servers.

```nginx
upstream backend {
    # Round-robin (default)
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
    server 10.0.0.3:3000;

    # Alternatives:
    # least_conn;      — Send to least busy server
    # ip_hash;         — Sticky sessions by client IP
    # hash $request_uri consistent; — Consistent hashing
}

server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://backend;
        proxy_next_upstream error timeout http_502 http_503;
    }
}
```

## SSL/TLS Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

## Rate Limiting

```nginx
http {
    # Define a rate limit zone
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://backend;
        }
    }
}
```

## Common Commands

```bash
# Test configuration
nginx -t

# Reload configuration without downtime
nginx -s reload

# Start / Stop
systemctl start nginx
systemctl stop nginx

# View access logs
tail -f /var/log/nginx/access.log
```

## Resources

- [Nginx Official Documentation](https://nginx.org/en/docs/)
- [Nginx Admin Guide](https://docs.nginx.com/nginx/admin-guide/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [Nginx Config — DigitalOcean Tool](https://www.digitalocean.com/community/tools/nginx)
