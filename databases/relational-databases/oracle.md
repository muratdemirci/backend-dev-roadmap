# Oracle Database

Oracle Database is a multi-model relational database management system produced by Oracle Corporation. It is one of the most widely used enterprise databases in the world, known for its scalability, reliability, and comprehensive feature set. Oracle DB is the backbone of many Fortune 500 companies, powering mission-critical applications in finance, healthcare, and government.

## Enterprise Features

- **Multi-Tenancy**: A single container database (CDB) can host multiple pluggable databases (PDBs), reducing overhead and simplifying management.
- **Advanced Security**: Transparent Data Encryption (TDE), Data Redaction, Database Vault, and Label Security.
- **High Availability**: Data Guard for disaster recovery, Flashback Technology for point-in-time recovery.
- **In-Memory**: Dual-format architecture stores data in both row and columnar formats simultaneously.
- **Advanced Compression**: Reduces storage requirements by 2x-4x with minimal performance impact.
- **Automatic Workload Repository (AWR)**: Collects performance statistics for analysis and tuning.

## PL/SQL

PL/SQL (Procedural Language/SQL) is Oracle's procedural extension to SQL. It allows developers to write complex business logic directly in the database.

```sql
-- Basic PL/SQL block
DECLARE
    v_employee_name VARCHAR2(100);
    v_salary NUMBER;
BEGIN
    SELECT first_name || ' ' || last_name, salary
    INTO v_employee_name, v_salary
    FROM employees
    WHERE employee_id = 101;

    IF v_salary > 50000 THEN
        DBMS_OUTPUT.PUT_LINE(v_employee_name || ' is a senior employee.');
    ELSE
        DBMS_OUTPUT.PUT_LINE(v_employee_name || ' is a junior employee.');
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Employee not found.');
END;
/
```

### Stored Procedures and Functions

```sql
-- Create a stored procedure
CREATE OR REPLACE PROCEDURE raise_salary (
    p_emp_id   IN  NUMBER,
    p_percent  IN  NUMBER
) AS
BEGIN
    UPDATE employees
    SET salary = salary * (1 + p_percent / 100)
    WHERE employee_id = p_emp_id;

    COMMIT;
END raise_salary;
/

-- Create a function
CREATE OR REPLACE FUNCTION get_department_count (
    p_dept_id IN NUMBER
) RETURN NUMBER AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM employees
    WHERE department_id = p_dept_id;

    RETURN v_count;
END get_department_count;
/
```

## Partitioning

Partitioning divides large tables into smaller, more manageable pieces while remaining transparent to the application. Oracle offers several partitioning strategies:

### Range Partitioning

```sql
CREATE TABLE sales (
    sale_id    NUMBER,
    sale_date  DATE,
    amount     NUMBER(10, 2)
)
PARTITION BY RANGE (sale_date) (
    PARTITION p_2024_q1 VALUES LESS THAN (DATE '2024-04-01'),
    PARTITION p_2024_q2 VALUES LESS THAN (DATE '2024-07-01'),
    PARTITION p_2024_q3 VALUES LESS THAN (DATE '2024-10-01'),
    PARTITION p_2024_q4 VALUES LESS THAN (DATE '2025-01-01')
);
```

### List Partitioning

```sql
CREATE TABLE customers (
    id      NUMBER,
    name    VARCHAR2(100),
    region  VARCHAR2(20)
)
PARTITION BY LIST (region) (
    PARTITION p_americas VALUES ('US', 'CA', 'BR'),
    PARTITION p_europe VALUES ('UK', 'DE', 'FR'),
    PARTITION p_asia VALUES ('JP', 'CN', 'IN')
);
```

### Hash Partitioning

```sql
CREATE TABLE logs (
    log_id   NUMBER,
    message  VARCHAR2(4000)
)
PARTITION BY HASH (log_id) PARTITIONS 8;
```

## Real Application Clusters (RAC)

Oracle RAC allows multiple Oracle instances on different servers to access a single database simultaneously. This provides both high availability and horizontal scalability.

### How RAC Works

- All nodes in the cluster share access to the same storage (SAN/NAS).
- **Cache Fusion** technology enables data blocks to be transferred between node memory over a high-speed interconnect, avoiding disk I/O.
- If one node fails, the surviving nodes automatically take over its workload.
- Clients connect through a Single Client Access Name (SCAN) which load-balances connections.

### RAC Benefits

- **Scalability**: Add more nodes to handle increased workload.
- **High Availability**: Node failure does not cause downtime.
- **Load Balancing**: Workload is distributed across all nodes.
- **Rolling Upgrades**: Patch or upgrade one node at a time with zero downtime.

## Useful Administrative Queries

```sql
-- Check tablespace usage
SELECT tablespace_name,
       ROUND(used_space * 8192 / 1024 / 1024, 2) AS used_mb,
       ROUND(tablespace_size * 8192 / 1024 / 1024, 2) AS total_mb
FROM dba_tablespace_usage_metrics;

-- Find the top SQL statements by elapsed time
SELECT sql_id, elapsed_time / 1000000 AS elapsed_sec, sql_text
FROM v$sql
ORDER BY elapsed_time DESC
FETCH FIRST 10 ROWS ONLY;
```

## Resources

- [Oracle Database Documentation](https://docs.oracle.com/en/database/)
- [Oracle Live SQL (Practice Playground)](https://livesql.oracle.com/)
- [Oracle Base - Technical Articles](https://oracle-base.com/)
- [Ask TOM - Oracle Community Q&A](https://asktom.oracle.com/)
- [Oracle Learning Library](https://www.oracle.com/database/technologies/appdev/plsql.html)
