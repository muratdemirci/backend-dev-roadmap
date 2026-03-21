# Apache Solr

Apache Solr is an open-source, enterprise-grade search platform built on Apache Lucene. It provides distributed indexing, full-text search, faceted navigation, and real-time indexing. Solr has been widely used in large-scale applications for over a decade.

## Core Concepts

- **Core** — An individual index instance with its own configuration and schema.
- **Document** — A unit of data composed of fields, stored in a core.
- **Schema** — Defines the fields, their types, and how they are indexed and stored.
- **Analyzer** — A chain of tokenizer and filters that process text during indexing and querying.
- **SolrCloud** — Distributed mode for high availability and horizontal scaling.

## Schema Definition

Solr uses `managed-schema` (or the legacy `schema.xml`) to define document structure.

```xml
<schema name="products" version="1.6">
  <field name="id" type="string" indexed="true" stored="true" required="true" />
  <field name="name" type="text_general" indexed="true" stored="true" />
  <field name="description" type="text_general" indexed="true" stored="true" />
  <field name="price" type="pfloat" indexed="true" stored="true" />
  <field name="category" type="string" indexed="true" stored="true" />
  <field name="created_at" type="pdate" indexed="true" stored="true" />

  <uniqueKey>id</uniqueKey>

  <fieldType name="text_general" class="solr.TextField">
    <analyzer type="index">
      <tokenizer class="solr.StandardTokenizerFactory"/>
      <filter class="solr.LowerCaseFilterFactory"/>
      <filter class="solr.StopFilterFactory" words="stopwords.txt"/>
    </analyzer>
    <analyzer type="query">
      <tokenizer class="solr.StandardTokenizerFactory"/>
      <filter class="solr.LowerCaseFilterFactory"/>
      <filter class="solr.SynonymGraphFilterFactory" synonyms="synonyms.txt"/>
    </analyzer>
  </fieldType>
</schema>
```

## Request Handlers

Request handlers define how Solr processes different types of requests. They are configured in `solrconfig.xml`.

```xml
<requestHandler name="/select" class="solr.SearchHandler">
  <lst name="defaults">
    <str name="echoParams">explicit</str>
    <str name="wt">json</str>
    <int name="rows">10</int>
    <str name="df">name</str>
  </lst>
</requestHandler>

<requestHandler name="/update" class="solr.UpdateRequestHandler" />

<requestHandler name="/suggest" class="solr.SearchHandler">
  <lst name="defaults">
    <str name="suggest">true</str>
    <str name="suggest.dictionary">mySuggester</str>
    <str name="suggest.count">5</str>
  </lst>
</requestHandler>
```

## Querying

```bash
# Basic query
curl "http://localhost:8983/solr/products/select?q=wireless+keyboard"

# Filtered query
curl "http://localhost:8983/solr/products/select?q=keyboard&fq=category:electronics&fq=price:[0 TO 100]"

# DisMax query for relevance tuning
curl "http://localhost:8983/solr/products/select?defType=edismax&q=wireless+keyboard&qf=name^3+description&pf=name^5"
```

## Faceted Search

Facets provide aggregated counts for field values, enabling guided navigation.

```bash
curl "http://localhost:8983/solr/products/select?q=*:*&facet=true&facet.field=category&facet.field=brand&facet.range=price&f.price.facet.range.start=0&f.price.facet.range.end=500&f.price.facet.range.gap=50"
```

Response includes facet counts:

```json
{
  "facet_counts": {
    "facet_fields": {
      "category": ["electronics", 42, "clothing", 28, "books", 15],
      "brand": ["acme", 30, "globex", 22]
    },
    "facet_ranges": {
      "price": { "counts": ["0", 5, "50", 12, "100", 8] }
    }
  }
}
```

## SolrCloud

SolrCloud provides distributed search with automatic sharding, replication, and leader election using Apache ZooKeeper.

```
┌────────────┐
│  ZooKeeper │  (cluster coordination)
└──────┬─────┘
       │
 ┌─────┴──────────────────┐
 │       SolrCloud         │
 │ ┌──────┐  ┌──────┐     │
 │ │Shard1│  │Shard2│     │
 │ │Leader│  │Leader│     │
 │ └──┬───┘  └──┬───┘     │
 │ ┌──┴───┐  ┌──┴───┐     │
 │ │Replic│  │Replic│     │
 └─┴──────┴──┴──────┴─────┘
```

Key features:

- Automatic leader election for each shard.
- Distributed queries across shards.
- Near real-time (NRT) indexing.
- Collection-level configuration management via ZooKeeper.

## Solr vs Elasticsearch

| Aspect | Solr | Elasticsearch |
|--------|------|---------------|
| Configuration | XML-based | JSON/REST API |
| Schema | Schema required (or schemaless) | Dynamic mapping |
| Distributed | SolrCloud + ZooKeeper | Built-in clustering |
| Query Syntax | Lucene syntax, DisMax | Query DSL (JSON) |
| Ecosystem | Standalone | ELK Stack |
| Community | Apache Foundation | Elastic (company-backed) |
| Strengths | Complex faceting, text search | Analytics, logging, ease of use |

## Resources

- [Apache Solr Official Documentation](https://solr.apache.org/guide/)
- [Solr Reference Guide](https://solr.apache.org/guide/solr/latest/)
- [Solr in Action — Manning](https://www.manning.com/books/solr-in-action)
- [Apache Lucene Documentation](https://lucene.apache.org/core/)
