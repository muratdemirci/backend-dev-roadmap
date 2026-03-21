# Database Normalization

Database normalization is the process of organizing a relational database to reduce data redundancy and improve data integrity. It involves decomposing tables into smaller, well-structured tables and defining relationships between them. Normalization follows a series of progressive rules called normal forms, each building on the previous one.

## Why Normalize?

- **Eliminate redundant data**: Store each piece of information in only one place.
- **Prevent update anomalies**: Avoid inconsistencies when data is modified.
- **Prevent insertion anomalies**: Avoid requiring unrelated data to insert a record.
- **Prevent deletion anomalies**: Avoid unintentional data loss when deleting records.

## Unnormalized Data Example

Consider a single table storing order information:

| OrderID | Customer | CustomerEmail     | Product  | Price | Qty |
| ------- | -------- | ----------------- | -------- | ----- | --- |
| 1       | Alice    | alice@example.com | Laptop   | 999   | 1   |
| 2       | Alice    | alice@example.com | Mouse    | 25    | 2   |
| 3       | Bob      | bob@example.com   | Keyboard | 75    | 1   |

Problems: Customer name and email are duplicated. If Alice changes her email, multiple rows must be updated.

## First Normal Form (1NF)

A table is in 1NF if:

- All columns contain only atomic (indivisible) values.
- Each column contains values of a single type.
- Each row is unique (has a primary key).
- There are no repeating groups.

```sql
-- Violates 1NF: multi-valued column
CREATE TABLE orders_bad (
    order_id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    products VARCHAR(500)  -- "Laptop, Mouse, Keyboard"
);

-- Satisfies 1NF: one value per cell
CREATE TABLE order_items (
    order_id INT,
    product_name VARCHAR(100),
    quantity INT,
    PRIMARY KEY (order_id, product_name)
);
```

## Second Normal Form (2NF)

A table is in 2NF if:

- It is in 1NF.
- Every non-key column depends on the entire primary key (no partial dependencies).

This mainly applies to tables with composite primary keys.

```sql
-- Violates 2NF: product_price depends only on product_name, not the full key
CREATE TABLE order_items_bad (
    order_id INT,
    product_name VARCHAR(100),
    quantity INT,
    product_price DECIMAL(10,2),  -- depends only on product_name
    PRIMARY KEY (order_id, product_name)
);

-- Satisfies 2NF: separate the product data
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    price DECIMAL(10,2)
);

CREATE TABLE order_items (
    order_id INT,
    product_id INT REFERENCES products(product_id),
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);
```

## Third Normal Form (3NF)

A table is in 3NF if:

- It is in 2NF.
- No non-key column depends on another non-key column (no transitive dependencies).

```sql
-- Violates 3NF: customer_email depends on customer_name, not on order_id
CREATE TABLE orders_bad (
    order_id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_email VARCHAR(255),  -- transitively depends on order_id via customer
    order_date DATE
);

-- Satisfies 3NF: separate customer data
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    order_date DATE
);
```

## Boyce-Codd Normal Form (BCNF)

BCNF is a stricter version of 3NF. A table is in BCNF if:

- It is in 3NF.
- Every determinant is a candidate key (every functional dependency has a superkey on the left side).

```sql
-- Consider: a student can have one advisor per subject,
-- and each advisor teaches only one subject.
-- Violates BCNF: advisor -> subject, but advisor is not a candidate key.

-- Decompose into two tables:
CREATE TABLE student_advisor (
    student_id INT,
    advisor_id INT,
    PRIMARY KEY (student_id, advisor_id)
);

CREATE TABLE advisor_subject (
    advisor_id INT PRIMARY KEY,
    subject VARCHAR(100)
);
```

## Normal Forms Summary

| Normal Form | Requirement                                     |
| ----------- | ----------------------------------------------- |
| 1NF         | Atomic values, no repeating groups              |
| 2NF         | 1NF + no partial dependencies                  |
| 3NF         | 2NF + no transitive dependencies               |
| BCNF        | 3NF + every determinant is a candidate key      |

## Denormalization

Denormalization is the deliberate introduction of redundancy to improve read performance. It is the opposite of normalization and is a common trade-off in practice.

### When to Denormalize

- **Read-heavy workloads**: When complex joins slow down frequently executed queries.
- **Reporting and analytics**: Pre-computed aggregates avoid expensive runtime calculations.
- **Caching layers**: Materialized views or summary tables speed up dashboards.
- **NoSQL databases**: Document stores often embrace denormalization by design.

```sql
-- Denormalized: store customer name directly in orders for faster reads
CREATE TABLE orders_denormalized (
    order_id INT PRIMARY KEY,
    customer_id INT,
    customer_name VARCHAR(100),  -- redundant, but avoids a JOIN
    order_date DATE,
    total DECIMAL(10,2)
);

-- Use materialized views for pre-computed summaries
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT DATE_TRUNC('month', order_date) AS month,
       SUM(total) AS revenue,
       COUNT(*) AS order_count
FROM orders
GROUP BY DATE_TRUNC('month', order_date);
```

### Trade-offs

| Aspect              | Normalized            | Denormalized              |
| ------------------- | --------------------- | ------------------------- |
| Data Redundancy     | Minimal               | Intentional duplication   |
| Write Performance   | Better                | Slower (multiple updates) |
| Read Performance    | Slower (more JOINs)   | Faster (fewer JOINs)     |
| Storage             | Less                  | More                      |
| Data Integrity      | Enforced by structure | Enforced by application   |

## Resources

- [Database Normalization Basics - Microsoft](https://learn.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description)
- [Normalization - Wikipedia](https://en.wikipedia.org/wiki/Database_normalization)
- [Designing Data-Intensive Applications (Book)](https://dataintensive.net/)
- [Normal Forms in DBMS - GeeksforGeeks](https://www.geeksforgeeks.org/normal-forms-in-dbms/)
- [The Art of PostgreSQL - Normalization Chapter](https://theartofpostgresql.com/)
