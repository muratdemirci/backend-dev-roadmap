# Apollo GraphQL

Apollo is a comprehensive platform for building, managing, and scaling GraphQL APIs. It provides both client and server libraries, along with tools for schema management, caching, and federation that enable a unified graph across multiple services.

## Apollo Server

Apollo Server is the most popular GraphQL server implementation for Node.js.

### Basic Setup

```javascript
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const typeDefs = `
  type Book {
    id: ID!
    title: String!
    author: Author!
    year: Int
  }

  type Author {
    id: ID!
    name: String!
    books: [Book!]!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    authors: [Author!]!
  }

  type Mutation {
    addBook(title: String!, authorId: ID!, year: Int): Book!
  }
`;

const resolvers = {
  Query: {
    books: (_, __, { dataSources }) => dataSources.bookAPI.getAll(),
    book: (_, { id }, { dataSources }) => dataSources.bookAPI.getById(id),
    authors: (_, __, { dataSources }) => dataSources.authorAPI.getAll(),
  },
  Mutation: {
    addBook: (_, args, { dataSources }) => dataSources.bookAPI.create(args),
  },
  Book: {
    author: (book, _, { dataSources }) =>
      dataSources.authorAPI.getById(book.authorId),
  },
  Author: {
    books: (author, _, { dataSources }) =>
      dataSources.bookAPI.getByAuthor(author.id),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, { listen: { port: 4000 } })
  .then(({ url }) => console.log(`Server ready at ${url}`));
```

## Apollo Client

Apollo Client is a state management library for JavaScript that integrates with GraphQL APIs. It handles data fetching, caching, and UI updates.

### React Integration

```javascript
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      title
      author {
        name
      }
    }
  }
`;

function BookList() {
  const { loading, error, data } = useQuery(GET_BOOKS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data.books.map(book => (
        <li key={book.id}>{book.title} by {book.author.name}</li>
      ))}
    </ul>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <BookList />
    </ApolloProvider>
  );
}
```

## Caching

Apollo Client uses a normalized, in-memory cache. Objects are stored by their `__typename` and `id`, so the same entity fetched in different queries is stored once.

```javascript
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        books: {
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
      },
    },
    Book: {
      keyFields: ['id'],  // Default — customize if needed
    },
  },
});
```

Cache operations:

```javascript
// Read from cache
const data = client.readQuery({ query: GET_BOOKS });

// Write to cache
client.writeQuery({
  query: GET_BOOKS,
  data: { books: [...data.books, newBook] },
});

// Evict from cache
cache.evict({ id: 'Book:123' });
cache.gc();
```

## Apollo Federation

Federation allows you to compose a single graph from multiple GraphQL services (subgraphs).

### Subgraph — Users Service

```javascript
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { gql } = require('graphql-tag');

const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    user(id: ID!): User
  }
`;
```

### Subgraph — Orders Service

```javascript
const typeDefs = gql`
  type Order @key(fields: "id") {
    id: ID!
    total: Float!
    user: User!
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    orders: [Order!]!
  }
`;
```

### Gateway (Router)

The Apollo Router composes subgraphs into a unified supergraph.

```yaml
# supergraph-config.yaml
subgraphs:
  users:
    routing_url: http://users-service:4001/graphql
    schema:
      subgraph_url: http://users-service:4001/graphql
  orders:
    routing_url: http://orders-service:4002/graphql
    schema:
      subgraph_url: http://orders-service:4002/graphql
```

## Schema Stitching

Schema stitching is an older approach to combining schemas (predating Federation). It merges schemas at the gateway level by delegating fields to remote schemas.

```javascript
const { stitchSchemas } = require('@graphql-tools/stitch');

const gatewaySchema = stitchSchemas({
  subschemas: [
    { schema: usersSchema, url: 'http://localhost:4001/graphql' },
    { schema: ordersSchema, url: 'http://localhost:4002/graphql' },
  ],
});
```

Federation is generally preferred over stitching for new projects due to better separation of concerns and tooling support.

## Resources

- [Apollo Documentation](https://www.apollographql.com/docs/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [Apollo Federation](https://www.apollographql.com/docs/federation/)
- [GraphQL Specification](https://spec.graphql.org/)
