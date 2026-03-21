# Client-Side Caching

Client-side caching stores data on the user's device to reduce network requests, improve performance, and enable offline access. The browser provides several mechanisms for caching, each suited to different use cases.

## Browser Cache (HTTP Cache)

The browser's built-in HTTP cache stores responses based on cache headers sent by the server. It is the most fundamental form of client-side caching and requires no JavaScript.

### How It Works

```
1. Browser requests a resource
2. Server responds with cache headers (Cache-Control, ETag, Last-Modified)
3. Browser stores the response in its cache
4. On subsequent requests, browser checks if the cached version is still valid
5. If valid: serves from cache (no network request)
6. If expired: revalidates with the server (conditional request)
```

### Cache Headers

```http
HTTP/1.1 200 OK
Cache-Control: max-age=3600, public
ETag: "abc123"
Last-Modified: Mon, 15 Jan 2024 10:30:00 GMT
```

### Conditional Requests

When a cached resource expires, the browser can revalidate instead of downloading the full resource again.

```http
GET /api/data HTTP/1.1
If-None-Match: "abc123"
If-Modified-Since: Mon, 15 Jan 2024 10:30:00 GMT
```

If the resource has not changed, the server responds with:

```http
HTTP/1.1 304 Not Modified
```

## localStorage

`localStorage` provides persistent key-value storage that survives browser restarts. Data remains until explicitly deleted.

```javascript
// Store data
localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Jane' }));

// Retrieve data
const user = JSON.parse(localStorage.getItem('user'));

// Remove data
localStorage.removeItem('user');

// Clear all
localStorage.clear();
```

### Characteristics

| Property | Value |
|----------|-------|
| Capacity | ~5-10 MB per origin |
| Persistence | Until manually cleared |
| Scope | Per origin (protocol + domain + port) |
| API | Synchronous |
| Data format | Strings only (use JSON.stringify/parse) |

### Caching API Responses with localStorage

```javascript
async function fetchWithCache(url, ttlMs = 300000) {
  const cacheKey = `cache:${url}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < ttlMs) {
      return data;
    }
  }

  const response = await fetch(url);
  const data = await response.json();
  localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
}
```

## sessionStorage

`sessionStorage` works like `localStorage` but data is cleared when the browser tab is closed.

```javascript
// Store data for the current session
sessionStorage.setItem('searchQuery', 'backend caching');

// Retrieve
const query = sessionStorage.getItem('searchQuery');
```

### localStorage vs sessionStorage

| Feature | localStorage | sessionStorage |
|---------|-------------|----------------|
| Persistence | Until cleared | Until tab is closed |
| Shared across tabs | Yes (same origin) | No (per tab) |
| Use case | Long-lived cache, preferences | Temporary state, form data |

## Service Workers

Service Workers are JavaScript workers that run in the background and can intercept network requests. They enable powerful caching strategies and full offline support.

### Registering a Service Worker

```javascript
// main.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker registered'))
    .catch(err => console.error('Registration failed', err));
}
```

### Cache-First Strategy

Serve from cache when available; fall back to the network.

```javascript
// sw.js
const CACHE_NAME = 'app-cache-v1';
const URLS_TO_CACHE = ['/', '/styles.css', '/app.js', '/api/config'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
```

### Network-First Strategy

Try the network first; fall back to cache if offline.

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
```

### Stale-While-Revalidate

Serve from cache immediately, then update the cache in the background.

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          cache.put(event.request, response.clone());
          return response;
        });
        return cached || fetchPromise;
      })
    )
  );
});
```

## Choosing the Right Strategy

| Strategy | Best For |
|----------|----------|
| Browser HTTP cache | Static assets, standard web requests |
| localStorage | User preferences, cached API data |
| sessionStorage | Temporary form state, per-tab data |
| Service Worker (Cache-First) | Offline-first apps, static assets |
| Service Worker (Network-First) | Dynamic data that should be fresh |
| Service Worker (Stale-While-Revalidate) | Content that can be briefly stale |

## Security Considerations

- Never store sensitive data (tokens, passwords) in localStorage or sessionStorage (vulnerable to XSS)
- Use `httpOnly` cookies for authentication tokens instead
- Service Workers require HTTPS (except localhost)
- Clear cached data when the user logs out

## Resources

- [MDN HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [MDN Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Google Developers - The Offline Cookbook](https://web.dev/offline-cookbook/)
- [Workbox (Google's Service Worker Library)](https://developer.chrome.com/docs/workbox/)
