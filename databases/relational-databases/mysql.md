# MySQL

MySQL is one of the most popular open-source relational database management systems in the world. Owned by Oracle Corporation, it powers many of the largest websites and applications, including Facebook, Twitter, and YouTube. MySQL is known for its speed, reliability, and ease of use, making it a go-to choice for web development.

## Storage Engines

MySQL supports multiple storage engines, each optimized for different use cases. The two most important are InnoDB and MyISAM.

### InnoDB

InnoDB is the default storage engine since MySQL 5.5 and the recommended choice for most applications.

- **ACID-compliant** with full transaction support.
- **Row-level locking** for high concurrency.
- **Foreign key** constraints for referential integrity.
- **Crash recovery** via redo logs.
- **MVCC** (Multi-Version Concurrency Control) for consistent reads.
- **Clustered index** on the primary key for fast lookups.

```sql
-- Create a table explicitly using InnoDB
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;
```

### MyISAM

MyISAM was the default engine before MySQL 5.5. It is simpler but lacks key features:

- **No transaction support** and no foreign keys.
- **Table-level locking**, which limits write concurrency.
- **Full-text search** support (though InnoDB now supports this too).
- **Smaller disk footprint** and faster for read-heavy workloads with simple queries.
- **COUNT(\*) is instant** because it stores the row count.

| Feature            | InnoDB         | MyISAM          |
| ------------------ | -------------- | --------------- |
| Transactions       | Yes            | No              |
| Locking            | Row-level      | Table-level     |
| Foreign Keys       | Yes            | No              |
| Crash Recovery     | Yes            | Limited         |
| Full-Text Search   | Yes (5.6+)     | Yes             |

## Replication

MySQL replication allows data from one server (source) to be copied to one or more servers (replicas).

### Asynchronous Replication

The default mode. The source writes to a binary log, and replicas pull changes.

```sql
-- On the source server
CHANGE REPLICATION SOURCE TO
    SOURCE_HOST='source_host',
    SOURCE_USER='repl_user',
    SOURCE_PASSWORD='password',
    SOURCE_LOG_FILE='mysql-bin.000001',
    SOURCE_LOG_POS=107;

-- Start replication on replica
START REPLICA;

-- Check replication status
SHOW REPLICA STATUS\G
```

### Semi-Synchronous Replication

The source waits for at least one replica to acknowledge receipt before committing.

### Group Replication

A plugin that provides distributed state machine replication with built-in conflict detection. Supports both single-primary and multi-primary modes.

## Performance Tuning

### Query Optimization

```sql
-- Use EXPLAIN to analyze query execution plans
EXPLAIN SELECT * FROM orders WHERE user_id = 42;

-- Use EXPLAIN ANALYZE for actual execution statistics (MySQL 8.0+)
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;

-- Add indexes for frequently queried columns
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Use covering indexes to avoid table lookups
CREATE INDEX idx_orders_cover ON orders (user_id, total, created_at);
```

### Key Configuration Parameters

```ini
# InnoDB buffer pool - allocate 70-80% of available RAM
innodb_buffer_pool_size = 4G

# Log file size - larger values improve write performance
innodb_log_file_size = 1G

# Query cache (removed in MySQL 8.0, use ProxySQL instead)
# query_cache_size = 64M

# Connection limits
max_connections = 200

# Temporary table size
tmp_table_size = 64M
max_heap_table_size = 64M
```

### Slow Query Log

```ini
# Enable the slow query log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
log_queries_not_using_indexes = 1
```

```bash
# Analyze slow query log
mysqldumpslow -s t /var/log/mysql/slow.log
```

## Useful Commands

```sql
-- Show running processes
SHOW PROCESSLIST;

-- Check table status and engine
SHOW TABLE STATUS LIKE 'orders';

-- Optimize a fragmented table
OPTIMIZE TABLE orders;

-- Check server status variables
SHOW GLOBAL STATUS LIKE 'Threads_connected';
```

## Resources

- [MySQL Official Documentation](https://dev.mysql.com/doc/)
- [MySQL Tutorial](https://www.mysqltutorial.org/)
- [High Performance MySQL (Book)](https://www.oreilly.com/library/view/high-performance-mysql/9781492080503/)
- [MySQL Performance Blog by Percona](https://www.percona.com/blog/)
- [Planet MySQL](https://planet.mysql.com/)
