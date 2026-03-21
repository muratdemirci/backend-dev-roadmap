# Caddy

Caddy is a modern, open-source web server written in Go. Its defining feature is automatic HTTPS — Caddy obtains and renews TLS certificates from Let's Encrypt by default, with zero configuration. Caddy is designed for simplicity, security, and ease of use.

## Key Features

- **Automatic HTTPS** — Provisions and renews TLS certificates automatically.
- **Simple Configuration** — The Caddyfile uses a human-readable syntax.
- **HTTP/3** — Built-in support for QUIC and HTTP/3.
- **Reverse Proxy** — Full-featured proxy with load balancing and health checks.
- **Zero Downtime Reloads** — Configuration changes are applied without dropping connections.
- **Single Binary** — No dependencies; easy to deploy.

## Caddyfile Basics

The Caddyfile is Caddy's primary configuration format.

### Static File Server

```caddyfile
example.com {
    root * /var/www/html
    file_server

    # Enable gzip and zstd compression
    encode gzip zstd

    # Custom error pages
    handle_errors {
        rewrite * /{err.status_code}.html
        file_server
    }
}
```

### Multiple Sites

```caddyfile
example.com {
    root * /var/www/example
    file_server
}

blog.example.com {
    root * /var/www/blog
    file_server
}

# HTTP only (no automatic HTTPS)
:8080 {
    respond "Hello from port 8080"
}
```

## Automatic HTTPS

Caddy automatically enables HTTPS for all sites with a domain name. It handles:

1. Obtaining a certificate from Let's Encrypt (or ZeroSSL).
2. Redirecting HTTP to HTTPS.
3. Renewing certificates before they expire.
4. OCSP stapling for certificate status verification.

```caddyfile
# This is all you need — HTTPS is automatic
example.com {
    reverse_proxy localhost:3000
}
```

To customize TLS settings:

```caddyfile
example.com {
    tls admin@example.com {
        protocols tls1.2 tls1.3
        ciphers TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
    }
    reverse_proxy localhost:3000
}
```

For local development with self-signed certificates:

```caddyfile
localhost {
    tls internal
    reverse_proxy localhost:3000
}
```

## Reverse Proxy

```caddyfile
api.example.com {
    reverse_proxy localhost:3000 {
        # Headers
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-Proto {scheme}

        # Timeouts
        transport http {
            dial_timeout 5s
            response_header_timeout 30s
        }
    }
}
```

### Load Balancing

```caddyfile
app.example.com {
    reverse_proxy {
        to 10.0.0.1:3000 10.0.0.2:3000 10.0.0.3:3000

        # Load balancing policy
        lb_policy round_robin
        # Alternatives: least_conn, random, first, ip_hash, header, cookie

        # Health checks
        health_uri /health
        health_interval 10s
        health_timeout 5s

        # Retry failed requests
        lb_try_duration 5s
    }
}
```

### WebSocket Proxy

```caddyfile
example.com {
    # WebSocket proxying works automatically
    reverse_proxy /ws localhost:3000

    # Everything else
    reverse_proxy localhost:3000
}
```

## HTTP/3 Support

HTTP/3 (QUIC) is enabled by default in Caddy when HTTPS is active.

```caddyfile
example.com {
    # HTTP/3 is on by default; explicitly configure if needed
    servers {
        protocols h1 h2 h3
    }
    reverse_proxy localhost:3000
}
```

## JSON Configuration API

Besides the Caddyfile, Caddy supports a full JSON configuration and a runtime admin API.

```bash
# View current configuration
curl localhost:2019/config/

# Update configuration dynamically
curl -X POST localhost:2019/config/ \
  -H "Content-Type: application/json" \
  -d '{
    "apps": {
      "http": {
        "servers": {
          "myserver": {
            "listen": [":443"],
            "routes": [{
              "handle": [{
                "handler": "reverse_proxy",
                "upstreams": [{"dial": "localhost:3000"}]
              }]
            }]
          }
        }
      }
    }
  }'

# Reload Caddyfile
caddy reload --config /etc/caddy/Caddyfile
```

## Common Commands

```bash
# Start with Caddyfile in current directory
caddy run

# Start as a background service
caddy start

# Stop
caddy stop

# Validate configuration
caddy validate --config /etc/caddy/Caddyfile

# Format Caddyfile
caddy fmt --overwrite /etc/caddy/Caddyfile

# Adapt Caddyfile to JSON (for debugging)
caddy adapt --config /etc/caddy/Caddyfile
```

## Resources

- [Caddy Official Documentation](https://caddyserver.com/docs/)
- [Caddyfile Concepts](https://caddyserver.com/docs/caddyfile/concepts)
- [Caddy GitHub Repository](https://github.com/caddyserver/caddy)
- [Caddy Community Forum](https://caddy.community/)
- [Let's Encrypt](https://letsencrypt.org/)
