# CouchDB

Apache CouchDB is an open-source, document-oriented NoSQL database that uses JSON for storing data, JavaScript for MapReduce indexes, and HTTP as its API. It embraces the web architecture with a RESTful interface and is designed for reliability with its multi-version concurrency control (MVCC) and eventual consistency model. CouchDB excels in distributed deployments where data needs to be replicated across multiple nodes or data centers.

## Key Features

- **Document-Oriented**: Stores data as JSON documents with flexible schemas.
- **RESTful HTTP API**: Every operation is performed via standard HTTP methods (GET, PUT, POST, DELETE).
- **MVCC**: Uses multi-version concurrency control so reads never block writes.
- **Eventual Consistency**: Designed for distributed systems where consistency converges over time.
- **Built-in Replication**: Master-master replication protocol that works over HTTP.
- **Offline-First**: With PouchDB (a JavaScript implementation), data can sync between browser and server.
- **Fault Tolerant**: Append-only data storage prevents data corruption.

## REST API

CouchDB's HTTP API makes it accessible from any language or tool that can make HTTP requests.

```bash
# Create a database
curl -X PUT http://localhost:5984/mydb

# Insert a document
curl -X POST http://localhost:5984/mydb \
    -H "Content-Type: application/json" \
    -d '{"name": "Alice", "email": "alice@example.com", "role": "admin"}'

# Get a document by ID
curl http://localhost:5984/mydb/document_id

# Update a document (must include _rev)
curl -X PUT http://localhost:5984/mydb/document_id \
    -H "Content-Type: application/json" \
    -d '{"_rev": "1-abc123", "name": "Alice", "email": "alice@new.com", "role": "admin"}'

# Delete a document
curl -X DELETE http://localhost:5984/mydb/document_id?rev=1-abc123

# List all documents
curl http://localhost:5984/mydb/_all_docs?include_docs=true

# Get database info
curl http://localhost:5984/mydb
```

## Views and MapReduce

CouchDB uses design documents containing JavaScript MapReduce functions to create indexes and query data.

```javascript
// Design document with a map function
{
    "_id": "_design/users",
    "views": {
        "by_role": {
            "map": "function(doc) { if (doc.role) { emit(doc.role, doc.name); } }",
            "reduce": "_count"
        },
        "by_email": {
            "map": "function(doc) { if (doc.email) { emit(doc.email, doc); } }"
        }
    }
}
```

```bash
# Query a view
curl http://localhost:5984/mydb/_design/users/_view/by_role

# Query with a specific key
curl http://localhost:5984/mydb/_design/users/_view/by_role?key="admin"

# Query with reduce
curl http://localhost:5984/mydb/_design/users/_view/by_role?group=true
```

## Mango Query (CouchDB 2.0+)

Mango provides a declarative JSON query syntax inspired by MongoDB.

```bash
# Create an index
curl -X POST http://localhost:5984/mydb/_index \
    -H "Content-Type: application/json" \
    -d '{"index": {"fields": ["role", "name"]}, "name": "role-name-index"}'

# Query using Mango selector
curl -X POST http://localhost:5984/mydb/_find \
    -H "Content-Type: application/json" \
    -d '{
        "selector": {
            "role": "admin",
            "name": {"$gt": "A"}
        },
        "fields": ["name", "email"],
        "sort": [{"name": "asc"}],
        "limit": 10
    }'
```

## Eventual Consistency

CouchDB uses an eventual consistency model, which means:

- Each node can accept writes independently.
- Changes propagate to other nodes during replication.
- Conflicts are detected automatically and stored as conflict revisions.
- The application is responsible for resolving conflicts (CouchDB picks a deterministic winner by default).

## Replication

CouchDB's replication protocol is one of its strongest features. It works over HTTP and can replicate between any two CouchDB-compatible databases.

```bash
# One-shot replication from source to target
curl -X POST http://localhost:5984/_replicate \
    -H "Content-Type: application/json" \
    -d '{"source": "mydb", "target": "http://remote:5984/mydb"}'

# Continuous replication
curl -X POST http://localhost:5984/_replicate \
    -H "Content-Type: application/json" \
    -d '{"source": "mydb", "target": "http://remote:5984/mydb", "continuous": true}'

# Filtered replication
curl -X POST http://localhost:5984/_replicate \
    -H "Content-Type: application/json" \
    -d '{
        "source": "mydb",
        "target": "http://remote:5984/mydb",
        "filter": "app/by_type",
        "query_params": {"type": "order"}
    }'
```

## Use Cases

- **Offline-first mobile and web apps** with PouchDB synchronization.
- **Content management systems** where schema flexibility is important.
- **Multi-datacenter deployments** requiring master-master replication.
- **Applications with intermittent connectivity** that need local data storage and sync.

## Resources

- [Apache CouchDB Official Documentation](https://docs.couchdb.org/)
- [CouchDB: The Definitive Guide](https://guide.couchdb.org/)
- [PouchDB - JavaScript Implementation](https://pouchdb.com/)
- [CouchDB Best Practices](https://docs.couchdb.org/en/stable/best-practices/)
- [Fauxton - CouchDB Web UI](https://couchdb.apache.org/fauxton-visual-guide/)
