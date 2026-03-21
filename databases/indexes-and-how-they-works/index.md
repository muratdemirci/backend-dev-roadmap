# Database Indexes and How They Work

A database index is a data structure that improves the speed of data retrieval operations on a table at the cost of additional storage space and slower writes. Without indexes, the database must scan every row in a table to find matching records (a full table scan). Indexes allow the database to locate data quickly, similar to how a book index helps you find a topic without reading every page.

## How Indexes Work

When you create an index on a column, the database builds a separate data structure that stores the indexed column values along with pointers to the corresponding rows. During a query, the database searches the index structure first, then follows the pointers to fetch the actual data.

```sql
-- Without an index: full table scan (O(n))
SELECT * FROM users WHERE email = 'alice@example.com';

-- Create an index
CREATE INDEX idx_users_email ON users (email);

-- With the index: index lookup (O(log n) for B-tree)
SELECT * FROM users WHERE email = 'alice@example.com';
```

## B-Tree Indexes

B-tree (balanced tree) is the most common index type and the default in most relational databases. It keeps data sorted and allows searches, insertions, and deletions in O(log n) time.

- Supports equality (`=`) and range queries (`<`, `>`, `BETWEEN`, `LIKE 'prefix%'`).
- Maintains sorted order, useful for `ORDER BY` queries.
- Works well for high-cardinality columns (many distinct values).

```sql
-- B-tree index (default)
CREATE INDEX idx_orders_date ON orders (order_date);

-- Efficient queries:
SELECT * FROM orders WHERE order_date = '2024-01-15';
SELECT * FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-03-31';
SELECT * FROM orders ORDER BY order_date DESC LIMIT 10;
```

## Hash Indexes

Hash indexes use a hash function to map values to buckets. They are extremely fast for equality lookups but do not support range queries.

```sql
-- Hash index (PostgreSQL)
CREATE INDEX idx_users_token ON users USING HASH (api_token);

-- Fast for equality
SELECT * FROM users WHERE api_token = 'abc123';

-- Cannot use hash index for:
-- SELECT * FROM users WHERE api_token > 'abc';
```

## GIN (Generalized Inverted Index)

GIN indexes are designed for composite values where each indexed item can contain multiple elements. They are ideal for full-text search, arrays, and JSONB data.

```sql
-- GIN index for full-text search
CREATE INDEX idx_articles_search ON articles USING GIN (to_tsvector('english', content));

SELECT * FROM articles
WHERE to_tsvector('english', content) @@ to_tsquery('database & indexing');

-- GIN index for JSONB
CREATE INDEX idx_events_data ON events USING GIN (data);

SELECT * FROM events WHERE data @> '{"type": "purchase"}';

-- GIN index for array columns
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);

SELECT * FROM posts WHERE tags @> ARRAY['postgresql'];
```

## GiST (Generalized Search Tree)

GiST indexes support complex data types and queries such as geometric operations, nearest-neighbor searches, and range types.

```sql
-- GiST index for geometric data (PostGIS)
CREATE INDEX idx_locations_geom ON locations USING GIST (geom);

SELECT * FROM locations
WHERE ST_DWithin(geom, ST_MakePoint(-73.99, 40.73)::geography, 1000);

-- GiST index for range types
CREATE INDEX idx_reservations_period ON reservations USING GIST (date_range);

SELECT * FROM reservations WHERE date_range && '[2024-06-01, 2024-06-30]'::daterange;
```

## Covering Indexes

A covering index includes all the columns needed by a query, allowing the database to satisfy the query entirely from the index without accessing the table (an index-only scan).

```sql
-- Covering index using INCLUDE (PostgreSQL 11+)
CREATE INDEX idx_orders_cover ON orders (customer_id)
    INCLUDE (order_date, total);

-- This query can be answered from the index alone
SELECT order_date, total FROM orders WHERE customer_id = 42;
```

## Composite Indexes

A composite index spans multiple columns. Column order matters because the index follows a left-to-right rule.

```sql
CREATE INDEX idx_orders_multi ON orders (status, order_date, customer_id);

-- Uses the index (matches leftmost columns)
SELECT * FROM orders WHERE status = 'shipped';
SELECT * FROM orders WHERE status = 'shipped' AND order_date > '2024-01-01';

-- Cannot efficiently use the index (skips the first column)
SELECT * FROM orders WHERE order_date > '2024-01-01';
```

## Partial Indexes

A partial index covers only a subset of rows, reducing index size and improving performance for targeted queries.

```sql
CREATE INDEX idx_active_orders ON orders (customer_id)
    WHERE status = 'active';

-- Uses the partial index
SELECT * FROM orders WHERE status = 'active' AND customer_id = 42;
```

## Using EXPLAIN to Analyze Queries

The `EXPLAIN` command reveals how the database plans to execute a query, including whether indexes are used.

```sql
-- Show the query plan
EXPLAIN SELECT * FROM users WHERE email = 'alice@example.com';

-- Show the plan with actual execution statistics
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;

-- Common scan types in output:
-- Seq Scan        = full table scan (no index used)
-- Index Scan      = index lookup + fetch row from table
-- Index Only Scan = query answered entirely from the index
-- Bitmap Scan     = index builds a bitmap, then fetches matching rows
```

## Index Best Practices

- Index columns used in `WHERE`, `JOIN`, and `ORDER BY` clauses.
- Avoid over-indexing: each index slows down `INSERT`, `UPDATE`, and `DELETE`.
- Use partial indexes for queries that target a specific subset of rows.
- Monitor unused indexes and remove them to save storage and write overhead.
- Analyze slow queries with `EXPLAIN ANALYZE` before adding indexes.
- Rebuild or reindex periodically to reduce index bloat.

## Resources

- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [MySQL Index Documentation](https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html)
- [Use The Index, Luke (Online Book)](https://use-the-index-luke.com/)
- [Markus Winand - SQL Performance Explained](https://sql-performance-explained.com/)
- [PostgreSQL EXPLAIN Documentation](https://www.postgresql.org/docs/current/sql-explain.html)
