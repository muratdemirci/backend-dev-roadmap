# Neo4j

Neo4j is the most widely used graph database. It stores data as nodes, relationships, and properties — a model known as the property graph. Neo4j excels at traversing highly connected data, making it ideal for social networks, recommendation engines, fraud detection, and knowledge graphs.

## Property Graph Model

In Neo4j, data is represented as:

- **Nodes** — Entities (e.g., Person, Movie, Product). Nodes have labels to categorize them.
- **Relationships** — Named, directed connections between nodes (e.g., ACTED_IN, FRIENDS_WITH). Relationships always have a type and direction.
- **Properties** — Key-value pairs attached to both nodes and relationships.

```
(:Person {name: "Alice", age: 30})-[:FRIENDS_WITH {since: 2020}]->(:Person {name: "Bob"})
(:Person {name: "Alice"})-[:WORKS_AT {role: "Engineer"}]->(:Company {name: "Acme"})
```

## Cypher Query Language

Cypher is Neo4j's declarative query language. It uses ASCII-art syntax to describe graph patterns.

### Creating Data

```cypher
// Create nodes
CREATE (alice:Person {name: 'Alice', age: 30})
CREATE (bob:Person {name: 'Bob', age: 28})
CREATE (acme:Company {name: 'Acme', founded: 2010})

// Create relationships
CREATE (alice)-[:FRIENDS_WITH {since: 2020}]->(bob)
CREATE (alice)-[:WORKS_AT {role: 'Engineer', since: 2021}]->(acme)
CREATE (bob)-[:WORKS_AT {role: 'Designer', since: 2022}]->(acme)
```

### Reading Data

```cypher
// Find a person by name
MATCH (p:Person {name: 'Alice'})
RETURN p

// Find Alice's friends
MATCH (alice:Person {name: 'Alice'})-[:FRIENDS_WITH]->(friend)
RETURN friend.name, friend.age

// Find who works at Acme
MATCH (person:Person)-[r:WORKS_AT]->(company:Company {name: 'Acme'})
RETURN person.name, r.role

// Variable-length path: friends of friends (1 to 3 hops)
MATCH (alice:Person {name: 'Alice'})-[:FRIENDS_WITH*1..3]->(fof)
RETURN DISTINCT fof.name
```

### Updating Data

```cypher
// Update properties
MATCH (p:Person {name: 'Alice'})
SET p.age = 31, p.email = 'alice@example.com'

// Add a label
MATCH (p:Person {name: 'Alice'})
SET p:Employee

// Remove a property
MATCH (p:Person {name: 'Alice'})
REMOVE p.email
```

### Deleting Data

```cypher
// Delete a relationship
MATCH (a:Person {name: 'Alice'})-[r:FRIENDS_WITH]->(b:Person {name: 'Bob'})
DELETE r

// Delete a node and its relationships
MATCH (p:Person {name: 'Bob'})
DETACH DELETE p
```

## Indexes

Indexes dramatically improve query performance for property lookups.

```cypher
// Create an index on Person.name
CREATE INDEX person_name FOR (p:Person) ON (p.name)

// Composite index
CREATE INDEX person_name_age FOR (p:Person) ON (p.name, p.age)

// Unique constraint (also creates an index)
CREATE CONSTRAINT unique_email FOR (p:Person) REQUIRE p.email IS UNIQUE

// Full-text index for search
CREATE FULLTEXT INDEX person_search FOR (p:Person) ON EACH [p.name, p.bio]

// List indexes
SHOW INDEXES
```

## APOC Library

APOC (Awesome Procedures on Cypher) is a standard library of useful procedures and functions.

```cypher
// Load data from JSON
CALL apoc.load.json('https://api.example.com/users') YIELD value
CREATE (p:Person {name: value.name, email: value.email})

// Export data to CSV
CALL apoc.export.csv.query(
  "MATCH (p:Person) RETURN p.name, p.age",
  "people.csv", {}
)

// Shortest path between nodes
MATCH (start:Person {name: 'Alice'}), (end:Person {name: 'Dave'})
CALL apoc.algo.dijkstra(start, end, 'FRIENDS_WITH', 'weight')
YIELD path, weight
RETURN path, weight

// Batch processing
CALL apoc.periodic.iterate(
  "MATCH (p:Person) WHERE p.age IS NULL RETURN p",
  "SET p.age = 0",
  {batchSize: 1000}
)
```

## Use Cases

| Use Case | Why Graph? |
|----------|-----------|
| Social Networks | Naturally model users and connections |
| Recommendation Engines | Traverse relationships for collaborative filtering |
| Fraud Detection | Discover hidden patterns across transactions |
| Knowledge Graphs | Represent and query complex domain knowledge |
| Network/IT Infrastructure | Map dependencies between systems |
| Identity & Access Management | Model roles, permissions, and hierarchies |

## Neo4j with JavaScript

```javascript
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
);

async function findFriends(name) {
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (p:Person {name: $name})-[:FRIENDS_WITH]->(friend) RETURN friend',
      { name }
    );
    return result.records.map(record => record.get('friend').properties);
  } finally {
    await session.close();
  }
}
```

## Resources

- [Neo4j Official Documentation](https://neo4j.com/docs/)
- [Cypher Manual](https://neo4j.com/docs/cypher-manual/current/)
- [APOC Library](https://neo4j.com/labs/apoc/)
- [Neo4j Graph Academy (Free Courses)](https://graphacademy.neo4j.com/)
- [Neo4j JavaScript Driver](https://neo4j.com/docs/javascript-manual/current/)
