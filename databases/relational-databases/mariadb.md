# MariaDB

MariaDB is an open-source relational database management system created as a fork of MySQL by the original MySQL developers after Oracle acquired Sun Microsystems. It aims to maintain compatibility with MySQL while adding new features, improved performance, and a commitment to remaining fully open-source under the GPL license.

## History and Relationship with MySQL

MariaDB was created in 2009 by Michael "Monty" Widenius, the original author of MySQL. The project was born out of concerns about Oracle's stewardship of MySQL. MariaDB is designed as a drop-in replacement for MySQL, meaning most MySQL applications work with MariaDB without modification.

## Key Differences from MySQL

| Feature                  | MariaDB                          | MySQL                         |
| ------------------------ | -------------------------------- | ----------------------------- |
| License                  | GPL (fully open-source)          | GPL + proprietary editions    |
| Default Storage Engine   | InnoDB (Aria for system tables)  | InnoDB                        |
| JSON Support             | Alias for LONGTEXT + validation  | Native JSON type              |
| Thread Pool              | Built-in (all editions)          | Enterprise only               |
| Virtual Columns          | Stored and virtual              | Generated columns             |
| Optimizer                | Enhanced (more strategies)       | Standard                      |
| Encryption               | Built-in at-rest encryption      | Enterprise or plugin          |
| Oracle Compatibility     | SQL_MODE=ORACLE available        | Not available                 |

## Additional Storage Engines

MariaDB ships with several storage engines not available in MySQL:

- **Aria**: A crash-safe improvement over MyISAM, used for internal temporary tables.
- **ColumnStore**: A columnar storage engine for analytical workloads and data warehousing.
- **Spider**: Enables sharding by partitioning data across multiple servers.
- **CONNECT**: Allows access to external data sources (CSV, JSON, XML, ODBC).
- **S3**: Store cold data in Amazon S3 while keeping it queryable.

```sql
-- Create a table using the Aria engine
CREATE TABLE sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255),
    expires_at DATETIME
) ENGINE=Aria;

-- Create a table using ColumnStore for analytics
CREATE TABLE sales_analytics (
    sale_date DATE,
    region VARCHAR(50),
    product_id INT,
    revenue DECIMAL(12, 2)
) ENGINE=ColumnStore;
```

## Galera Cluster

Galera Cluster is a synchronous multi-master replication solution for MariaDB. It enables true multi-master clustering where every node can handle reads and writes simultaneously.

### Key Features

- **Synchronous replication**: All nodes have the same data at all times.
- **Multi-master**: Read and write to any node.
- **Automatic node provisioning**: New nodes automatically sync their state.
- **No slave lag**: Since replication is synchronous.
- **Automatic membership control**: Failed nodes are removed from the cluster.

### How It Works

1. A transaction is executed locally on one node.
2. At commit time, the write-set is broadcast to all nodes.
3. Each node certifies the write-set against pending transactions.
4. If certification passes, the transaction is applied on all nodes.
5. If certification fails (conflict), the transaction is rolled back on the originating node.

### Configuration Example

```ini
# Galera Cluster configuration in my.cnf
[mysqld]
binlog_format=ROW
default_storage_engine=InnoDB
innodb_autoinc_lock_mode=2

# Galera Provider
wsrep_on=ON
wsrep_provider=/usr/lib/galera/libgalera_smm.so

# Cluster settings
wsrep_cluster_name="my_cluster"
wsrep_cluster_address="gcomm://node1_ip,node2_ip,node3_ip"
wsrep_node_name="node1"
wsrep_node_address="node1_ip"

# State Snapshot Transfer method
wsrep_sst_method=mariabackup
wsrep_sst_auth=backup_user:password
```

```sql
-- Check cluster status
SHOW STATUS LIKE 'wsrep_cluster_size';
SHOW STATUS LIKE 'wsrep_cluster_status';
SHOW STATUS LIKE 'wsrep_ready';

-- Check if the node is synced
SHOW STATUS LIKE 'wsrep_local_state_comment';
```

## Advantages of MariaDB

- **Performance**: Enhanced query optimizer with more join strategies and subquery optimizations.
- **Transparency**: Open development model with public roadmap and mailing lists.
- **Compatibility**: Drop-in replacement for MySQL with added features.
- **Security**: Built-in data-at-rest encryption, role-based access control, and PAM authentication.
- **Analytics**: ColumnStore engine provides a built-in solution for OLAP workloads.
- **Community**: Vibrant community with contributions from many organizations.

## Resources

- [MariaDB Official Documentation](https://mariadb.com/kb/en/)
- [MariaDB vs MySQL Compatibility](https://mariadb.com/kb/en/mariadb-vs-mysql-compatibility/)
- [Galera Cluster Documentation](https://galeracluster.com/library/documentation/)
- [MariaDB Server Blog](https://mariadb.org/blog/)
- [MariaDB Foundation](https://mariadb.org/)
