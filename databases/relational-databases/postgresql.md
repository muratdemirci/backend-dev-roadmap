# PostgreSQL

PostgreSQL is a powerful, open-source object-relational database system with over 35 years of active development. It is known for its reliability, feature robustness, and performance. PostgreSQL runs on all major operating systems and is fully ACID-compliant, making it a top choice for enterprise and web applications alike.

## Key Features

- **ACID Compliance**: Full support for transactions with atomicity, consistency, isolation, and durability.
- **Extensibility**: Users can define custom data types, operators, index types, and even procedural languages.
- **MVCC (Multi-Version Concurrency Control)**: Allows multiple transactions to work simultaneously without locking.
- **Write-Ahead Logging (WAL)**: Ensures data integrity even in the event of a crash.
- **Table Inheritance**: Supports object-oriented concepts like table inheritance.
- **Foreign Data Wrappers**: Query external data sources as if they were local tables.

## Data Types

PostgreSQL offers a rich set of built-in data types:

| Category     | Types                                      |
| ------------ | ------------------------------------------ |
| Numeric      | `INTEGER`, `BIGINT`, `NUMERIC`, `REAL`     |
| Character    | `VARCHAR`, `TEXT`, `CHAR`                  |
| Date/Time    | `TIMESTAMP`, `DATE`, `INTERVAL`            |
| Boolean      | `BOOLEAN`                                  |
| JSON         | `JSON`, `JSONB`                            |
| Array        | Any data type can be used as an array      |
| UUID         | `UUID`                                     |
| Network      | `INET`, `CIDR`, `MACADDR`                 |

## Indexes

Indexes are critical for query performance. PostgreSQL supports several index types:

- **B-tree**: The default index type, suitable for equality and range queries.
- **Hash**: Optimized for simple equality checks.
- **GIN (Generalized Inverted Index)**: Ideal for full-text search and JSONB queries.
- **GiST (Generalized Search Tree)**: Used for geometric data and full-text search.
- **BRIN (Block Range Index)**: Efficient for very large, naturally ordered tables.

```sql
-- Create a B-tree index
CREATE INDEX idx_users_email ON users (email);

-- Create a GIN index on a JSONB column
CREATE INDEX idx_orders_data ON orders USING GIN (data);

-- Create a partial index
CREATE INDEX idx_active_users ON users (email) WHERE active = true;
```

## JSON Support

PostgreSQL provides first-class JSON support through two types: `JSON` (stores raw text) and `JSONB` (stores binary, decomposed format for faster queries).

```sql
-- Create a table with JSONB column
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    payload JSONB NOT NULL
);

-- Insert JSON data
INSERT INTO events (payload) VALUES ('{"type": "click", "page": "/home", "duration": 3.5}');

-- Query JSONB fields
SELECT payload->>'type' AS event_type FROM events;

-- Filter using JSONB containment operator
SELECT * FROM events WHERE payload @> '{"type": "click"}';

-- Create an index for JSONB queries
CREATE INDEX idx_events_payload ON events USING GIN (payload);
```

## Extensions

Extensions add powerful capabilities to PostgreSQL without modifying the core:

```sql
-- Enable popular extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Trigram text similarity
CREATE EXTENSION IF NOT EXISTS "postgis";     -- Geographic objects
CREATE EXTENSION IF NOT EXISTS "hstore";      -- Key-value pairs

-- Use uuid-ossp to generate a UUID
SELECT uuid_generate_v4();

-- Use pg_trgm for fuzzy text matching
SELECT * FROM products WHERE name % 'laptap';  -- finds "laptop"
```

## Backup with pg_dump

`pg_dump` is the standard utility for backing up a PostgreSQL database.

```bash
# Dump a database to a SQL file
pg_dump -U postgres -d mydb > backup.sql

# Dump in custom format (compressed, supports parallel restore)
pg_dump -U postgres -Fc -d mydb -f backup.dump

# Dump only the schema (no data)
pg_dump -U postgres --schema-only -d mydb > schema.sql

# Restore from a custom format dump
pg_restore -U postgres -d mydb backup.dump

# Dump a single table
pg_dump -U postgres -d mydb -t users > users_backup.sql
```

## Common Administrative Queries

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('mydb'));

-- List active connections
SELECT pid, usename, state, query FROM pg_stat_activity;

-- Find slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [PostgreSQL Wiki](https://wiki.postgresql.org/)
- [pgExercises - Practice SQL](https://pgexercises.com/)
- [The Art of PostgreSQL](https://theartofpostgresql.com/)
