# Elasticsearch

Elasticsearch is a distributed, RESTful search and analytics engine built on top of Apache Lucene. It provides near real-time search capabilities and is designed to handle large volumes of structured and unstructured data.

## How It Works — Inverted Index

Elasticsearch uses an inverted index data structure, which maps terms to the documents that contain them. This is the key to its fast full-text search performance.

```
Term        → Document IDs
─────────────────────────
"backend"   → [1, 3, 7]
"developer" → [1, 2, 5, 7]
"roadmap"   → [2, 3]
"api"       → [1, 4, 5, 6]
```

When a search query arrives, Elasticsearch looks up terms in the inverted index rather than scanning every document.

## Core Concepts

- **Index** — A collection of documents with similar characteristics (analogous to a database).
- **Document** — A JSON object stored in an index (analogous to a row).
- **Shard** — A subdivision of an index distributed across nodes.
- **Replica** — A copy of a shard for fault tolerance and read throughput.
- **Node** — A single Elasticsearch server instance.
- **Cluster** — A collection of nodes working together.

## Mappings

Mappings define how documents and their fields are stored and indexed.

```json
PUT /products
{
  "mappings": {
    "properties": {
      "name": { "type": "text", "analyzer": "standard" },
      "description": { "type": "text" },
      "price": { "type": "float" },
      "category": { "type": "keyword" },
      "created_at": { "type": "date" },
      "in_stock": { "type": "boolean" },
      "tags": { "type": "keyword" }
    }
  }
}
```

Key field types:

- **text** — Analyzed for full-text search (tokenized).
- **keyword** — Exact match, used for filtering, sorting, and aggregations.
- **date**, **float**, **integer**, **boolean** — Typed fields for structured data.

## Indexing Documents

```json
POST /products/_doc/1
{
  "name": "Wireless Keyboard",
  "description": "Ergonomic wireless keyboard with backlight",
  "price": 49.99,
  "category": "electronics",
  "tags": ["keyboard", "wireless", "ergonomic"],
  "in_stock": true,
  "created_at": "2025-01-15"
}
```

## Queries

### Full-Text Search

```json
GET /products/_search
{
  "query": {
    "match": {
      "description": "ergonomic wireless"
    }
  }
}
```

### Bool Query (Compound)

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "description": "wireless" } }
      ],
      "filter": [
        { "term": { "category": "electronics" } },
        { "range": { "price": { "lte": 100 } } }
      ],
      "should": [
        { "term": { "tags": "ergonomic" } }
      ]
    }
  }
}
```

## Aggregations

Aggregations provide analytics capabilities on top of search results.

```json
GET /products/_search
{
  "size": 0,
  "aggs": {
    "avg_price": { "avg": { "field": "price" } },
    "categories": {
      "terms": { "field": "category" },
      "aggs": {
        "avg_category_price": { "avg": { "field": "price" } }
      }
    },
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          { "to": 25 },
          { "from": 25, "to": 75 },
          { "from": 75 }
        ]
      }
    }
  }
}
```

## The ELK Stack

Elasticsearch is commonly used as part of the ELK stack:

- **Elasticsearch** — Stores and searches data.
- **Logstash** — Ingests data from multiple sources, transforms it, and sends it to Elasticsearch.
- **Kibana** — Visualizes data stored in Elasticsearch through dashboards and charts.

Beats (lightweight data shippers) are often added, making it the Elastic Stack.

```
[App Logs] → Filebeat → Logstash → Elasticsearch → Kibana
[Metrics]  → Metricbeat ─────────→ Elasticsearch → Kibana
```

## Resources

- [Elasticsearch Official Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Elasticsearch: The Definitive Guide](https://www.elastic.co/guide/en/elasticsearch/guide/current/index.html)
- [Elastic Stack (ELK) Tutorial](https://www.elastic.co/what-is/elk-stack)
- [Elasticsearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
