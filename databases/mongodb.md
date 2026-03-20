Welcome to the MongoDB DocsMongoDB is a document-oriented, operational database built from the ground up as an alternative to the relational database for modern applications.  Unlike relational databases, MongoDB allows developers to store rich JSON-like documents that map naturally to the objects they use in their code:

```
{   firstname: &quot;Bob&quot;,   lastname: &quot;Smith&quot;,   email: &quot;bob@smith.com&quot;,   address: {      street: &quot;100 Main St&quot;,      city: &quot;Anytown&quot;,      state: &quot;MO&quot;,      zip: &quot;11111&quot;   }}
```
Which you can retrieve with queries such as:

```
users.find({address.zip: &quot;11111&quot;})
```
### MongoDB also offers

- Strong consistency with ACID transactions.

- Modern additional built-in query capabilities such as geospatial search, lexical search, and vector search.

- Serverless horizontal scaling with geography-aware fault tolerance across all major clouds.

- Security primitives that allow MongoDB to operate in the most demanding of enterprise environments.

How This Documentation is OrganizedGet Started

Start here! This guide walks you through deploying your first database
and downloading all the tools and libraries you need to start developing
with MongoDB.

Development

Everything you need to know to write apps with MongoDB, from connecting,
CRUD, and the core query language, to index optimization and data modeling.

Management

Learn how to administer and manage MongoDB deployments, including
provisioning, scaling, backup, monitoring, disaster recovery, and security.

Client Libraries

Explore the documentation for MongoDB&#x27;s catalog of client libraries,
which are available in almost every modern programming language and
compatible with most application frameworks. Each client library has
detailed documentation and an API reference in that library&#x27;s native
programming language.

Tools

Find useful tools and integrations to aid in both development
and management, including simplified database management,
integration, migration, and data visualization.

Atlas Architecture Center

Learn best practices for designing scalable, secure, and resilient
systems using MongoDB in enterprise environments. Guidance includes
architecture fundamentals, MongoDB capabilities, and reference architectures.