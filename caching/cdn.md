# CDN (Content Delivery Network)

A Content Delivery Network is a geographically distributed network of servers that delivers web content to users from the nearest location. CDNs reduce latency, improve load times, and offload traffic from origin servers by caching content at edge locations around the world.

## How a CDN Works

```
1. User requests a resource (image, API response, static file)
2. DNS resolves the request to the nearest CDN edge server
3. Edge server checks its cache for the resource
4. If cached (HIT): returns the resource immediately
5. If not cached (MISS): fetches from origin, caches it, then returns it
6. Subsequent requests from nearby users are served from the edge cache
```

```
User (Tokyo)  ──> CDN Edge (Tokyo)  ──> Origin Server (US-East)
User (London) ──> CDN Edge (London) ──> Origin Server (US-East)
User (NYC)    ──> CDN Edge (NYC)    ──> Origin Server (US-East)
```

## Edge Servers

Edge servers are CDN nodes deployed in data centers around the world (Points of Presence, or PoPs). They:

- Cache static and dynamic content close to end users
- Terminate TLS connections locally for faster handshakes
- Absorb traffic spikes and DDoS attacks
- Reduce bandwidth costs on the origin server

## Cache Control Headers

CDNs rely on HTTP cache headers to determine how content should be cached.

```http
Cache-Control: public, max-age=86400, s-maxage=604800
```

| Header | Purpose |
|--------|---------|
| `Cache-Control: public` | Any cache (browser, CDN) may store the response |
| `Cache-Control: private` | Only the browser may cache; CDN must not |
| `max-age` | How long the browser should cache (seconds) |
| `s-maxage` | How long the CDN should cache (overrides max-age for shared caches) |
| `no-cache` | Revalidate with origin before using cached version |
| `no-store` | Do not cache at all |
| `ETag` | A fingerprint for cache validation |
| `Vary` | Cache separate versions based on request headers (e.g., Accept-Encoding) |

## Cache Invalidation

Updating cached content across a CDN is one of the hardest problems in caching.

### Strategies

| Strategy | Description |
|----------|-------------|
| **TTL-based** | Content expires after a set time; simple but not immediate |
| **Purge** | Manually remove specific URLs from all edge caches |
| **Purge by tag/key** | Invalidate all resources sharing a cache tag |
| **Cache busting** | Append version strings to URLs (`style.v2.css` or `style.css?v=abc123`) |
| **Stale-while-revalidate** | Serve stale content while fetching fresh content in the background |

```bash
# Example: Purging a URL on Cloudflare via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"files": ["https://example.com/assets/style.css"]}'
```

## CDN for APIs

CDNs are not limited to static assets. They can cache API responses as well.

```javascript
// Express.js: Set cache headers for a public API endpoint
app.get('/api/products', (req, res) => {
  const products = getProducts();
  res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
  res.json(products);
});
```

For personalized or authenticated content, use:
```http
Cache-Control: private, no-store
```

## Major CDN Providers

| Provider | Key Features |
|----------|-------------|
| **Cloudflare** | Global network, DDoS protection, Workers (edge compute), free tier |
| **AWS CloudFront** | Deep AWS integration, Lambda@Edge, origin failover |
| **Fastly** | Real-time purging, VCL configuration, edge compute |
| **Akamai** | Largest network, enterprise-focused, advanced security |
| **Google Cloud CDN** | GCP integration, Anycast IP, low-latency global network |
| **Azure CDN** | Azure integration, multiple CDN providers under one API |

## CDN Configuration Example (AWS CloudFront)

```json
{
  "Origins": {
    "Items": [{
      "DomainName": "api.example.com",
      "Id": "myOrigin",
      "CustomOriginConfig": {
        "OriginProtocolPolicy": "https-only"
      }
    }]
  },
  "DefaultCacheBehavior": {
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "Compress": true
  }
}
```

## Benefits

- **Reduced latency**: Content is served from the nearest edge location
- **Lower origin load**: Cached content reduces requests to your servers
- **DDoS protection**: CDN absorbs malicious traffic at the edge
- **Global scalability**: Handle traffic from anywhere in the world
- **Cost savings**: Reduced bandwidth and infrastructure costs

## When Not to Use a CDN

- Highly personalized content that cannot be cached
- Real-time data that changes on every request
- Internal applications with no external users
- Very low traffic where the complexity is not justified

## Resources

- [Cloudflare - What is a CDN?](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [MDN HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Fastly Documentation](https://docs.fastly.com/)
- [Web.dev - Content Delivery Networks](https://web.dev/content-delivery-networks/)
