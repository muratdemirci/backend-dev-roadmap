# Apache HTTP Server

Apache HTTP Server (httpd) is one of the oldest and most widely used open-source web servers. It features a modular architecture, extensive configuration options, and support for dynamic content through modules like mod_php and mod_rewrite. Apache powers a significant portion of websites worldwide.

## Core Concepts

- **Modular Architecture** — Functionality is provided by loadable modules.
- **Configuration Files** — `httpd.conf` is the main configuration; `.htaccess` allows per-directory overrides.
- **Multi-Processing Modules (MPMs)** — Determine how Apache handles concurrent connections.
- **Virtual Hosts** — Serve multiple websites from a single server.

## httpd.conf — Main Configuration

The main server configuration file is typically at `/etc/httpd/conf/httpd.conf` or `/etc/apache2/apache2.conf`.

```apache
# Server basics
ServerRoot "/etc/httpd"
Listen 80
ServerName www.example.com:80
ServerAdmin admin@example.com

# Document root
DocumentRoot "/var/www/html"
<Directory "/var/www/html">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>

# Load modules
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule ssl_module modules/mod_ssl.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so

# Logging
ErrorLog "logs/error_log"
CustomLog "logs/access_log" combined
LogLevel warn

# Include additional configs
IncludeOptional conf.d/*.conf
```

## .htaccess

`.htaccess` files provide per-directory configuration without editing the main config. They require `AllowOverride` to be enabled.

```apache
# Enable rewrite engine
RewriteEngine On

# Redirect HTTP to HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove trailing slash
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.+)/$ /$1 [L,R=301]

# Custom error pages
ErrorDocument 404 /errors/404.html
ErrorDocument 500 /errors/500.html

# Deny access to sensitive files
<FilesMatch "\.(env|log|sql)$">
    Require all denied
</FilesMatch>

# Enable gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>
```

## mod_rewrite

mod_rewrite is a powerful URL rewriting engine that uses regular expressions.

```apache
RewriteEngine On

# Clean URLs: /products/42 → /index.php?type=products&id=42
RewriteRule ^([a-z]+)/([0-9]+)$ /index.php?type=$1&id=$2 [L,QSA]

# API versioning
RewriteRule ^api/v([0-9]+)/(.*)$ /api/$2?version=$1 [L,QSA]

# Block specific user agents
RewriteCond %{HTTP_USER_AGENT} (BadBot|Scraper) [NC]
RewriteRule .* - [F]

# Maintenance mode
# RewriteCond %{REMOTE_ADDR} !^192\.168\.1\.
# RewriteRule .* /maintenance.html [R=503,L]
```

## Multi-Processing Modules (MPMs)

MPMs control how Apache handles concurrent requests.

### prefork MPM

One process per connection. Compatible with non-thread-safe modules (e.g., mod_php).

```apache
<IfModule mpm_prefork_module>
    StartServers          5
    MinSpareServers       5
    MaxSpareServers      10
    MaxRequestWorkers   150
    MaxConnectionsPerChild 3000
</IfModule>
```

### worker MPM

Hybrid multi-process/multi-threaded. More efficient than prefork.

```apache
<IfModule mpm_worker_module>
    StartServers          2
    MinSpareThreads      25
    MaxSpareThreads      75
    ThreadsPerChild      25
    MaxRequestWorkers   150
    MaxConnectionsPerChild 0
</IfModule>
```

### event MPM

Based on worker but handles keep-alive connections more efficiently. Recommended for modern deployments.

```apache
<IfModule mpm_event_module>
    StartServers          2
    MinSpareThreads      25
    MaxSpareThreads      75
    ThreadsPerChild      25
    MaxRequestWorkers   150
    MaxConnectionsPerChild 0
</IfModule>
```

## Virtual Hosts

Serve multiple websites from one Apache instance.

```apache
# Name-based virtual hosting
<VirtualHost *:80>
    ServerName www.site-a.com
    DocumentRoot /var/www/site-a
</VirtualHost>

<VirtualHost *:80>
    ServerName www.site-b.com
    DocumentRoot /var/www/site-b
</VirtualHost>

# HTTPS virtual host
<VirtualHost *:443>
    ServerName www.site-a.com
    DocumentRoot /var/www/site-a
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/site-a.crt
    SSLCertificateKeyFile /etc/ssl/private/site-a.key
</VirtualHost>
```

## Reverse Proxy

```apache
<VirtualHost *:80>
    ServerName api.example.com

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    # Load balancing
    <Proxy "balancer://backend">
        BalancerMember http://10.0.0.1:3000
        BalancerMember http://10.0.0.2:3000
        ProxySet lbmethod=byrequests
    </Proxy>
    ProxyPass /app balancer://backend/app
</VirtualHost>
```

## Resources

- [Apache HTTP Server Documentation](https://httpd.apache.org/docs/)
- [mod_rewrite Reference](https://httpd.apache.org/docs/current/mod/mod_rewrite.html)
- [Apache MPM Documentation](https://httpd.apache.org/docs/current/mpm.html)
- [Apache Virtual Host Examples](https://httpd.apache.org/docs/current/vhosts/examples.html)
