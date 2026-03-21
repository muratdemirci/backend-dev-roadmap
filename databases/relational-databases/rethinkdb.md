# RethinkDB

RethinkDB is an open-source, distributed document database designed from the ground up for real-time applications. Unlike traditional databases where the application polls for changes, RethinkDB pushes updated query results to the application in real time. This makes it an excellent choice for collaborative apps, real-time dashboards, multiplayer games, and IoT platforms.

## Key Features

- **Real-Time Push Architecture**: The database pushes changes to the application rather than requiring polling.
- **Changefeeds**: Subscribe to query results and receive updates as data changes.
- **Distributed Architecture**: Automatic sharding and replication with a simple web UI.
- **ReQL Query Language**: A chainable, embeddable query language that integrates naturally with your programming language.
- **JSON Document Store**: Stores schemaless JSON documents.
- **Join Support**: Unlike many NoSQL databases, RethinkDB supports efficient distributed joins.
- **Atomic Operations**: Per-document atomicity for consistent updates.

## ReQL Query Language

ReQL (RethinkDB Query Language) is not a string-based query language like SQL. Instead, it is built into the host language using method chaining. This makes queries composable and easy to build programmatically.

### Basic CRUD Operations

```javascript
const r = require('rethinkdb');

// Connect to the database
const conn = await r.connect({ host: 'localhost', port: 28015, db: 'myapp' });

// Create a table
await r.tableCreate('users').run(conn);

// Insert a document
await r.table('users').insert({
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 30,
    tags: ['developer', 'admin']
}).run(conn);

// Read documents with filtering
const users = await r.table('users')
    .filter(r.row('age').gt(25))
    .orderBy('name')
    .run(conn);

// Update a document
await r.table('users')
    .filter({ email: 'alice@example.com' })
    .update({ age: 31 })
    .run(conn);

// Delete a document
await r.table('users')
    .filter({ email: 'alice@example.com' })
    .delete()
    .run(conn);
```

### Advanced Queries

```javascript
// Join two tables
const result = await r.table('orders')
    .eqJoin('user_id', r.table('users'))
    .zip()
    .run(conn);

// Group and aggregate
const stats = await r.table('orders')
    .group('status')
    .count()
    .run(conn);

// Map-reduce
const totalByUser = await r.table('orders')
    .group('user_id')
    .map(r.row('amount'))
    .reduce((a, b) => a.add(b))
    .run(conn);

// Nested document manipulation
await r.table('users')
    .get(userId)
    .update({ tags: r.row('tags').append('editor') })
    .run(conn);
```

## Changefeeds

Changefeeds are the defining feature of RethinkDB. They allow the application to subscribe to real-time notifications whenever data changes.

```javascript
// Subscribe to all changes on a table
const cursor = await r.table('messages').changes().run(conn);

cursor.each((err, change) => {
    if (err) throw err;
    console.log('New change:', change);
    // change.old_val - the previous value (null for inserts)
    // change.new_val - the new value (null for deletes)
});

// Subscribe to filtered changes
const filteredCursor = await r.table('orders')
    .filter({ status: 'pending' })
    .changes()
    .run(conn);

// Subscribe with squashing (batch rapid changes)
const squashedCursor = await r.table('sensors')
    .changes({ squash: 1.0 }) // squash changes within 1 second
    .run(conn);

// Include initial results along with future changes
const fullCursor = await r.table('chat_rooms')
    .filter({ room_id: 'general' })
    .changes({ includeInitial: true })
    .run(conn);
```

## Sharding and Replication

RethinkDB provides built-in support for distributing data across a cluster:

- **Sharding**: Tables can be split across multiple servers. RethinkDB automatically handles routing queries to the correct shard.
- **Replication**: Each shard can be replicated to multiple servers for fault tolerance.
- **Web Admin UI**: A built-in dashboard at `http://localhost:8080` for managing shards, replicas, and monitoring performance.

```javascript
// Configure a table with 3 shards and 2 replicas
await r.table('events').reconfigure({ shards: 3, replicas: 2 }).run(conn);

// Check table status
const status = await r.table('events').status().run(conn);
```

## Use Cases

- **Real-time dashboards**: Push live metrics and analytics to users.
- **Collaborative editing**: Sync document changes across users instantly.
- **Multiplayer games**: Broadcast game state updates to all players.
- **IoT data ingestion**: Stream sensor data and react to changes in real time.
- **Chat applications**: Deliver messages instantly without polling.

## Resources

- [RethinkDB Official Documentation](https://rethinkdb.com/docs/)
- [RethinkDB API Reference](https://rethinkdb.com/api/javascript/)
- [RethinkDB GitHub Repository](https://github.com/rethinkdb/rethinkdb)
- [Ten-Minute Guide to RethinkDB](https://rethinkdb.com/docs/guide/javascript/)
- [RethinkDB vs Other Databases](https://rethinkdb.com/docs/comparison-tables/)
