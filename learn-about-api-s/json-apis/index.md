# JSON:API

JSON:API is a specification for building APIs that use JSON as the data format. It provides conventions for how resources should be structured, how relationships are expressed, and how common operations like pagination, sorting, and filtering should work. By following the spec, both clients and servers can avoid reinventing these patterns for every API.

## Why JSON:API?

Without a shared specification, every API team invents its own conventions for response structure, error handling, pagination, and linking. JSON:API standardizes these decisions so that:

- Clients can use generic libraries to consume any JSON:API-compliant API
- Responses are predictable and self-describing
- Common problems (N+1 queries, over-fetching) have built-in solutions

## Resource Objects

The fundamental building block of JSON:API is the resource object. Every resource has a `type` and an `id`.

```json
{
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "Introduction to JSON:API",
      "body": "JSON:API is a specification for building APIs...",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "relationships": {
      "author": {
        "data": { "type": "users", "id": "42" }
      },
      "tags": {
        "data": [
          { "type": "tags", "id": "5" },
          { "type": "tags", "id": "8" }
        ]
      }
    },
    "links": {
      "self": "/api/articles/1"
    }
  }
}
```

### Key Rules

- `type` and `id` together uniquely identify a resource
- `attributes` holds the resource's data fields
- `relationships` describes connections to other resources
- `links` provides URLs for navigating the API

## Relationships

JSON:API distinguishes between to-one and to-many relationships, and uses resource linkage (type + id) to express them.

```json
{
  "data": {
    "type": "articles",
    "id": "1",
    "relationships": {
      "author": {
        "links": {
          "self": "/api/articles/1/relationships/author",
          "related": "/api/articles/1/author"
        },
        "data": { "type": "users", "id": "42" }
      }
    }
  },
  "included": [
    {
      "type": "users",
      "id": "42",
      "attributes": {
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  ]
}
```

The `included` section contains full resource objects for related resources, solving the N+1 problem by allowing compound documents.

## Sparse Fieldsets

Clients can request only the fields they need, reducing payload size.

```
GET /api/articles?fields[articles]=title,createdAt&fields[users]=name
```

This returns only `title` and `createdAt` for articles and only `name` for included users.

## Pagination

JSON:API supports pagination through `links` in the top-level response.

```json
{
  "data": [ ... ],
  "links": {
    "self": "/api/articles?page[number]=2&page[size]=10",
    "first": "/api/articles?page[number]=1&page[size]=10",
    "prev": "/api/articles?page[number]=1&page[size]=10",
    "next": "/api/articles?page[number]=3&page[size]=10",
    "last": "/api/articles?page[number]=5&page[size]=10"
  },
  "meta": {
    "totalPages": 5,
    "totalCount": 47
  }
}
```

Common pagination strategies:
- **Page-based**: `?page[number]=2&page[size]=10`
- **Offset-based**: `?page[offset]=20&page[limit]=10`
- **Cursor-based**: `?page[cursor]=eyJpZCI6NDJ9&page[size]=10`

## Sorting

Use the `sort` query parameter with comma-separated fields. Prefix with `-` for descending order.

```
GET /api/articles?sort=-createdAt,title
```

## Filtering

The spec reserves the `filter` query parameter but does not define a specific format.

```
GET /api/articles?filter[author]=42&filter[status]=published
```

## Error Objects

JSON:API defines a standardized error format.

```json
{
  "errors": [
    {
      "status": "422",
      "source": { "pointer": "/data/attributes/title" },
      "title": "Invalid Attribute",
      "detail": "Title must be at least 5 characters long."
    },
    {
      "status": "422",
      "source": { "pointer": "/data/attributes/email" },
      "title": "Invalid Attribute",
      "detail": "Email is not a valid email address."
    }
  ]
}
```

## Creating and Updating Resources

```bash
# Create
POST /api/articles
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "attributes": {
      "title": "New Article",
      "body": "Content here..."
    },
    "relationships": {
      "author": {
        "data": { "type": "users", "id": "42" }
      }
    }
  }
}
```

```bash
# Update (PATCH)
PATCH /api/articles/1
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "Updated Title"
    }
  }
}
```

## Content Type

JSON:API uses the media type `application/vnd.api+json`. Both requests and responses should set this in the `Content-Type` header.

## Resources

- [JSON:API Specification](https://jsonapi.org/)
- [JSON:API Examples](https://jsonapi.org/examples/)
- [JSON:API Implementations (client and server libraries)](https://jsonapi.org/implementations/)
- [JSON:API FAQ](https://jsonapi.org/faq/)
- [Comparison: JSON:API vs GraphQL vs REST](https://nordicapis.com/json-api-vs-graphql-vs-rest/)
