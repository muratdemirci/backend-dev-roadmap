# Database Transactions

A database transaction is a sequence of one or more SQL operations that are executed as a single logical unit of work. Transactions ensure data integrity by guaranteeing that either all operations complete successfully or none of them take effect. They are essential for any application that modifies data, from simple web forms to complex financial systems.

## Transaction Basics

### BEGIN, COMMIT, and ROLLBACK

Every transaction follows a simple lifecycle:

1. **BEGIN**: Start a new transaction.
2. Execute one or more SQL statements.
3. **COMMIT**: Make all changes permanent.
4. **ROLLBACK**: Undo all changes if something goes wrong.

```sql
-- Successful transaction
BEGIN;
INSERT INTO accounts (name, balance) VALUES ('Alice', 1000);
INSERT INTO accounts (name, balance) VALUES ('Bob', 500);
COMMIT;

-- Failed transaction with rollback
BEGIN;
UPDATE accounts SET balance = balance - 200 WHERE name = 'Alice';
UPDATE accounts SET balance = balance + 200 WHERE name = 'Bob';
-- Something went wrong, undo everything
ROLLBACK;
```

### Savepoints

Savepoints allow you to create intermediate checkpoints within a transaction. You can roll back to a savepoint without aborting the entire transaction.

```sql
BEGIN;

INSERT INTO orders (customer_id, total) VALUES (1, 100.00);
SAVEPOINT order_created;

INSERT INTO order_items (order_id, product_id, qty) VALUES (1, 101, 2);
-- This insert fails due to some constraint
ROLLBACK TO SAVEPOINT order_created;

-- The order is still inserted; only the order_items insert was undone
INSERT INTO order_items (order_id, product_id, qty) VALUES (1, 102, 1);
COMMIT;
```

## Isolation Levels

Isolation levels control how much a transaction is affected by the actions of other concurrent transactions. Different levels offer different trade-offs between consistency and performance.

### Read Uncommitted

The lowest isolation level. Transactions can see uncommitted changes from other transactions (dirty reads).

```sql
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
BEGIN;
-- Can see data that other transactions haven't committed yet
SELECT * FROM accounts;
COMMIT;
```

### Read Committed

The default level in PostgreSQL and Oracle. A transaction only sees data that has been committed before each statement executes.

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- Returns 1000
-- Another transaction commits: UPDATE accounts SET balance = 800 WHERE id = 1;
SELECT balance FROM accounts WHERE id = 1;  -- Returns 800 (non-repeatable read)
COMMIT;
```

### Repeatable Read

The default level in MySQL/InnoDB. Once a transaction reads a row, it sees the same value for the duration of the transaction.

```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- Returns 1000
-- Another transaction commits a change to this row
SELECT balance FROM accounts WHERE id = 1;  -- Still returns 1000
COMMIT;
```

### Serializable

The strictest isolation level. Transactions execute as if they were running one after another. This prevents all concurrency anomalies but has the highest performance cost.

```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
SELECT SUM(balance) FROM accounts;  -- No other transaction can modify accounts
-- until this transaction completes
COMMIT;
```

## Deadlocks

A deadlock occurs when two or more transactions are waiting for each other to release locks, creating a circular dependency. Neither transaction can proceed.

### Deadlock Example

```
Transaction A:                           Transaction B:
BEGIN;                                   BEGIN;
UPDATE accounts SET balance = 900        UPDATE products SET stock = 50
  WHERE id = 1;  -- locks row 1           WHERE id = 1;  -- locks product 1

UPDATE products SET stock = 45           UPDATE accounts SET balance = 1100
  WHERE id = 1;  -- waits for B           WHERE id = 1;  -- waits for A

-- DEADLOCK! Both are waiting for each other
```

### Deadlock Prevention Strategies

- **Consistent lock ordering**: Always acquire locks in the same order across all transactions.
- **Keep transactions short**: Minimize the time locks are held.
- **Use lower isolation levels**: When strict consistency is not required.
- **Retry logic in application code**: Databases detect deadlocks and abort one transaction; the application should retry.

```javascript
// Application-level retry for deadlocks
async function executeWithRetry(fn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (error.code === '40P01' && attempt < maxRetries) { // PostgreSQL deadlock code
                console.log(`Deadlock detected, retrying (attempt ${attempt})`);
                await new Promise(r => setTimeout(r, 100 * attempt));
                continue;
            }
            throw error;
        }
    }
}
```

## Implicit vs Explicit Transactions

```sql
-- Implicit transaction (autocommit mode)
-- Each statement is its own transaction
INSERT INTO logs (message) VALUES ('action performed');
-- Automatically committed

-- Explicit transaction
BEGIN;
INSERT INTO logs (message) VALUES ('action started');
INSERT INTO logs (message) VALUES ('action completed');
COMMIT;
-- Both inserts committed together
```

## Distributed Transactions

In microservices architectures, transactions may span multiple databases. Common patterns include:

- **Two-Phase Commit (2PC)**: A coordinator asks all participants to prepare, then commit. Guarantees consistency but is slow.
- **Saga Pattern**: A sequence of local transactions with compensating actions for rollback. More suitable for microservices.
- **Outbox Pattern**: Write events to a local outbox table within the same transaction, then publish asynchronously.

## Best Practices

- Keep transactions as short as possible to reduce lock contention.
- Avoid user interaction during an open transaction.
- Always handle transaction failures with proper rollback logic.
- Use the lowest isolation level that meets your consistency requirements.
- Implement retry logic for deadlock handling in application code.
- Monitor long-running transactions and set statement timeouts.

## Resources

- [PostgreSQL Transactions Documentation](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [MySQL Transactions and Locking](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-model.html)
- [Designing Data-Intensive Applications - Chapter 7](https://dataintensive.net/)
- [Saga Pattern - Microservices.io](https://microservices.io/patterns/data/saga.html)
- [Transaction Isolation in SQL Server](https://learn.microsoft.com/en-us/sql/connect/jdbc/understanding-isolation-levels)
