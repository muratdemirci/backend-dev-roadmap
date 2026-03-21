# ACID Properties

ACID is an acronym that stands for Atomicity, Consistency, Isolation, and Durability. These four properties guarantee that database transactions are processed reliably, even in the event of errors, power failures, or system crashes. ACID compliance is a fundamental requirement for any system that handles critical data such as financial transactions, inventory management, or user accounts.

## Atomicity

Atomicity guarantees that a transaction is treated as a single, indivisible unit of work. Either all operations within the transaction succeed, or none of them do. There is no partial completion.

### Example: Bank Transfer

```sql
BEGIN TRANSACTION;

-- Deduct from sender
UPDATE accounts SET balance = balance - 500 WHERE account_id = 'A001';

-- Add to receiver
UPDATE accounts SET balance = balance + 500 WHERE account_id = 'A002';

-- If both succeed, make the changes permanent
COMMIT;

-- If anything fails, undo everything
-- ROLLBACK;
```

If the system crashes after the first UPDATE but before the second, atomicity ensures that the first deduction is rolled back. The sender does not lose money without the receiver gaining it.

## Consistency

Consistency ensures that a transaction brings the database from one valid state to another valid state. All defined rules, constraints, cascades, and triggers must be satisfied after the transaction completes.

### Example: Enforcing Constraints

```sql
-- The balance cannot go negative
ALTER TABLE accounts ADD CONSTRAINT positive_balance CHECK (balance >= 0);

BEGIN TRANSACTION;

-- This will fail if account A001 has less than 10000
UPDATE accounts SET balance = balance - 10000 WHERE account_id = 'A001';

-- The constraint violation causes the entire transaction to fail
-- The database remains in its previous consistent state
COMMIT;
```

Consistency also covers:

- **Referential integrity**: Foreign keys must reference existing rows.
- **Unique constraints**: No duplicate values in unique columns.
- **Data type constraints**: Values must match their defined data types.
- **Application-level rules**: Business logic enforced through triggers or stored procedures.

## Isolation

Isolation determines how transaction integrity is visible to other concurrent transactions. It prevents concurrent transactions from interfering with each other. SQL defines four isolation levels:

### Isolation Levels

| Level              | Dirty Read | Non-Repeatable Read | Phantom Read |
| ------------------ | ---------- | ------------------- | ------------ |
| Read Uncommitted   | Possible   | Possible            | Possible     |
| Read Committed     | Prevented  | Possible            | Possible     |
| Repeatable Read    | Prevented  | Prevented           | Possible     |
| Serializable       | Prevented  | Prevented           | Prevented    |

### Example: Isolation in Action

```sql
-- Transaction A (running at Repeatable Read)
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN TRANSACTION;
SELECT balance FROM accounts WHERE account_id = 'A001';  -- Returns 1000

    -- Meanwhile, Transaction B commits:
    -- UPDATE accounts SET balance = 500 WHERE account_id = 'A001';
    -- COMMIT;

SELECT balance FROM accounts WHERE account_id = 'A001';  -- Still returns 1000
COMMIT;
-- Transaction A sees a consistent snapshot throughout its lifetime
```

### Common Isolation Problems

- **Dirty Read**: Reading data that has been modified by an uncommitted transaction.
- **Non-Repeatable Read**: Reading the same row twice yields different results because another transaction committed a change.
- **Phantom Read**: A query returns a different set of rows when executed again because another transaction inserted or deleted rows.

## Durability

Durability guarantees that once a transaction has been committed, it will remain so, even in the event of a power loss, crash, or any other failure. The changes are persisted to non-volatile storage.

### How Databases Achieve Durability

- **Write-Ahead Logging (WAL)**: Changes are written to a log before being applied to the database. After a crash, the log is replayed to restore committed transactions.
- **Checkpointing**: Periodically flushes dirty pages from memory to disk, reducing recovery time.
- **Replication**: Data is copied to multiple nodes so that a single hardware failure does not cause data loss.

```sql
-- Once this COMMIT returns successfully, the data is guaranteed to be on disk
BEGIN TRANSACTION;
INSERT INTO audit_log (action, timestamp) VALUES ('user_login', NOW());
COMMIT;
-- Even if the server crashes right after this line, the insert is safe
```

## ACID in Practice

```sql
-- A complete ACID-compliant transaction example
BEGIN TRANSACTION;

-- Atomicity: all-or-nothing
INSERT INTO orders (customer_id, total) VALUES (42, 299.99);

-- Get the generated order ID
-- Consistency: foreign key ensures customer 42 exists

INSERT INTO order_items (order_id, product_id, quantity)
VALUES (LASTVAL(), 101, 2);

-- Isolation: other transactions see either the old state or the new state, not a mix
UPDATE inventory SET stock = stock - 2 WHERE product_id = 101;

-- Durability: after COMMIT, all changes survive any failure
COMMIT;
```

## Resources

- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [MySQL InnoDB and the ACID Model](https://dev.mysql.com/doc/refman/8.0/en/mysql-acid.html)
- [ACID Properties - Wikipedia](https://en.wikipedia.org/wiki/ACID)
- [Designing Data-Intensive Applications (Book)](https://dataintensive.net/)
- [Jepsen - Distributed Systems Safety Research](https://jepsen.io/)
