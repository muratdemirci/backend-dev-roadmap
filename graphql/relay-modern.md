# Relay Modern

Relay Modern is a JavaScript framework for building data-driven React applications with GraphQL. Developed by Meta (Facebook), Relay uses a fragment-driven approach where each component declares its own data requirements, and the framework handles efficient data fetching, caching, and updates.

## Core Principles

- **Fragment-Driven** — Each component specifies exactly the data it needs via GraphQL fragments.
- **Colocation** — Data requirements live alongside the component that uses them.
- **Compiler** — A build-time compiler optimizes queries and generates type-safe artifacts.
- **Consistency** — The normalized store ensures data consistency across the UI.

## Fragment-Driven Data Fetching

In Relay, components declare their data needs using GraphQL fragments. Parent components compose child fragments without knowing their contents.

### Defining Fragments

```javascript
import { graphql, useFragment } from 'react-relay';

// BookCard component declares its data needs
function BookCard({ bookRef }) {
  const book = useFragment(
    graphql`
      fragment BookCard_book on Book {
        id
        title
        coverUrl
        author {
          name
        }
      }
    `,
    bookRef
  );

  return (
    <div>
      <img src={book.coverUrl} alt={book.title} />
      <h3>{book.title}</h3>
      <p>by {book.author.name}</p>
    </div>
  );
}
```

### Composing Fragments in a Query

```javascript
import { graphql, useLazyLoadQuery } from 'react-relay';

function BookListPage() {
  const data = useLazyLoadQuery(
    graphql`
      query BookListPageQuery {
        books {
          id
          ...BookCard_book
        }
      }
    `,
    {}
  );

  return (
    <div>
      {data.books.map(book => (
        <BookCard key={book.id} bookRef={book} />
      ))}
    </div>
  );
}
```

The parent query includes `...BookCard_book` without knowing which fields it contains. Relay composes all fragments into a single optimized query at build time.

## Relay Compiler

The Relay Compiler runs at build time and performs several important tasks:

- Validates all GraphQL queries and fragments against the schema.
- Generates optimized query artifacts and TypeScript/Flow types.
- Persists queries for automatic persisted queries (APQ).
- Removes GraphQL strings from the production bundle.

```bash
# Run the compiler
relay-compiler

# Watch mode during development
relay-compiler --watch
```

Configuration in `relay.config.js`:

```javascript
module.exports = {
  src: './src',
  schema: './schema.graphql',
  language: 'typescript',
  exclude: ['**/node_modules/**', '**/__generated__/**'],
  artifactDirectory: './src/__generated__',
};
```

## Pagination with Connections

Relay defines a standard for cursor-based pagination called the Connection specification.

### Connection Schema

```graphql
type Query {
  books(first: Int, after: String, last: Int, before: String): BookConnection!
}

type BookConnection {
  edges: [BookEdge!]!
  pageInfo: PageInfo!
}

type BookEdge {
  node: Book!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### Using Pagination in Components

```javascript
import { graphql, usePaginationFragment } from 'react-relay';

function BookList({ queryRef }) {
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    graphql`
      fragment BookList_query on Query
      @refetchable(queryName: "BookListPaginationQuery") {
        books(first: $count, after: $cursor)
        @connection(key: "BookList_books") {
          edges {
            node {
              id
              ...BookCard_book
            }
          }
        }
      }
    `,
    queryRef
  );

  return (
    <div>
      {data.books.edges.map(({ node }) => (
        <BookCard key={node.id} bookRef={node} />
      ))}
      {hasNext && (
        <button onClick={() => loadNext(10)} disabled={isLoadingNext}>
          {isLoadingNext ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

## Mutations

```javascript
import { graphql, useMutation } from 'react-relay';

function AddBookForm() {
  const [commit, isInFlight] = useMutation(
    graphql`
      mutation AddBookFormMutation($input: AddBookInput!) {
        addBook(input: $input) {
          bookEdge {
            node {
              id
              title
              ...BookCard_book
            }
          }
        }
      }
    `
  );

  function handleSubmit(title, authorId) {
    commit({
      variables: { input: { title, authorId } },
      updater: (store) => {
        // Update the connection in the store
        const connection = store.get('client:root:__BookList_books_connection');
        const newEdge = store.getRootField('addBook').getLinkedRecord('bookEdge');
        if (connection && newEdge) {
          ConnectionHandler.insertEdgeAfter(connection, newEdge);
        }
      },
    });
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Relay Environment

The Relay Environment ties together the network layer and store.

```javascript
import { Environment, Network, RecordSource, Store } from 'relay-runtime';

const network = Network.create(async (operation, variables) => {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: operation.text, variables }),
  });
  return response.json();
});

const environment = new Environment({
  network,
  store: new Store(new RecordSource()),
});
```

## Resources

- [Relay Official Documentation](https://relay.dev/)
- [Relay GitHub Repository](https://github.com/facebook/relay)
- [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
- [Thinking in Relay](https://relay.dev/docs/principles-and-architecture/thinking-in-relay/)
- [Relay Compiler](https://relay.dev/docs/guides/compiler/)
