# DynamoDB

Amazon DynamoDB is a fully managed, serverless NoSQL database service provided by AWS. It delivers single-digit millisecond performance at any scale and supports both key-value and document data models. DynamoDB handles all infrastructure management, including hardware provisioning, setup, configuration, replication, software patching, and cluster scaling.

## Key Concepts

### Tables, Items, and Attributes

- **Table**: A collection of items (similar to a table in a relational database).
- **Item**: A single data record in a table (similar to a row).
- **Attribute**: A fundamental data element within an item (similar to a column).

### Primary Keys

Every DynamoDB table requires a primary key, which can take one of two forms:

- **Partition Key (Simple Primary Key)**: A single attribute that DynamoDB uses to distribute data across partitions.
- **Partition Key + Sort Key (Composite Primary Key)**: A two-attribute key where the partition key determines the partition and the sort key orders items within that partition.

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

// Create a table with a composite primary key
const params = {
    TableName: 'Orders',
    KeySchema: [
        { AttributeName: 'customerId', KeyType: 'HASH' },  // Partition key
        { AttributeName: 'orderDate', KeyType: 'RANGE' }    // Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: 'customerId', AttributeType: 'S' },
        { AttributeName: 'orderDate', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
};

await dynamodb.createTable(params).promise();
```

## CRUD Operations

```javascript
const docClient = new AWS.DynamoDB.DocumentClient();

// Put an item
await docClient.put({
    TableName: 'Orders',
    Item: {
        customerId: 'CUST-001',
        orderDate: '2024-01-15',
        total: 149.99,
        status: 'shipped',
        items: ['SKU-100', 'SKU-205']
    }
}).promise();

// Get an item by primary key
const result = await docClient.get({
    TableName: 'Orders',
    Key: { customerId: 'CUST-001', orderDate: '2024-01-15' }
}).promise();

// Query items by partition key with sort key condition
const orders = await docClient.query({
    TableName: 'Orders',
    KeyConditionExpression: 'customerId = :cid AND orderDate BETWEEN :start AND :end',
    ExpressionAttributeValues: {
        ':cid': 'CUST-001',
        ':start': '2024-01-01',
        ':end': '2024-12-31'
    }
}).promise();

// Update an item
await docClient.update({
    TableName: 'Orders',
    Key: { customerId: 'CUST-001', orderDate: '2024-01-15' },
    UpdateExpression: 'SET #s = :status, updatedAt = :now',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':status': 'delivered', ':now': new Date().toISOString() }
}).promise();

// Delete an item
await docClient.delete({
    TableName: 'Orders',
    Key: { customerId: 'CUST-001', orderDate: '2024-01-15' }
}).promise();
```

## Global Secondary Indexes (GSI)

A GSI allows you to query a table using an alternative partition key and optional sort key. The GSI has its own throughput settings and is eventually consistent.

```javascript
// Add a GSI when creating a table
const params = {
    TableName: 'Orders',
    GlobalSecondaryIndexes: [{
        IndexName: 'StatusIndex',
        KeySchema: [
            { AttributeName: 'status', KeyType: 'HASH' },
            { AttributeName: 'orderDate', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
    }]
};

// Query using the GSI
const pendingOrders = await docClient.query({
    TableName: 'Orders',
    IndexName: 'StatusIndex',
    KeyConditionExpression: '#s = :status',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':status': 'pending' }
}).promise();
```

## Local Secondary Indexes (LSI)

An LSI shares the same partition key as the table but uses a different sort key. LSIs must be created at table creation time and are strongly consistent.

| Feature           | GSI                              | LSI                             |
| ----------------- | -------------------------------- | ------------------------------- |
| Partition Key     | Any attribute                    | Same as table                   |
| Sort Key          | Any attribute                    | Different from table            |
| Creation          | Anytime                          | Table creation only             |
| Consistency       | Eventually consistent            | Strongly or eventually          |
| Throughput        | Separate from table              | Shared with table               |
| Size Limit        | No limit                         | 10 GB per partition key         |

## Provisioned vs On-Demand Capacity

### Provisioned Mode

You specify the number of reads and writes per second. Best for predictable workloads.

```javascript
// Provisioned capacity
{
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
        ReadCapacityUnits: 100,
        WriteCapacityUnits: 50
    }
}
```

Auto Scaling can adjust capacity automatically based on utilization targets.

### On-Demand Mode

DynamoDB automatically scales to handle any workload. You pay per request. Best for unpredictable or spiky workloads.

```javascript
// On-demand capacity
{
    BillingMode: 'PAY_PER_REQUEST'
}
```

## DynamoDB Streams

DynamoDB Streams captures item-level changes and makes them available for up to 24 hours. Commonly used to trigger AWS Lambda functions for event-driven architectures.

```javascript
// Enable streams on a table
await dynamodb.updateTable({
    TableName: 'Orders',
    StreamSpecification: {
        StreamEnabled: true,
        StreamViewType: 'NEW_AND_OLD_IMAGES'
    }
}).promise();
```

## Resources

- [Amazon DynamoDB Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [The DynamoDB Book by Alex DeBrie](https://www.dynamodbbook.com/)
- [DynamoDB Guide](https://www.dynamodbguide.com/)
- [NoSQL Workbench for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.html)
