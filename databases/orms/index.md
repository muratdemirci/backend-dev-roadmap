# ORMs (Object-Relational Mappers)

An Object-Relational Mapper (ORM) is a programming technique and library that maps objects in your application code to rows in a relational database. Instead of writing raw SQL queries, developers interact with the database using the programming language's native objects and methods. ORMs bridge the gap between object-oriented programming and relational databases, often referred to as the "impedance mismatch."

## How ORMs Work

1. **Model Definition**: You define classes or schemas that represent database tables.
2. **Query Building**: The ORM translates method calls into SQL queries.
3. **Result Mapping**: Database rows are converted into language-native objects.
4. **Change Tracking**: The ORM tracks modifications and generates appropriate INSERT, UPDATE, or DELETE statements.

## Popular ORMs by Language

### Sequelize (Node.js)

```javascript
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

// Define a model
const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true },
    age: DataTypes.INTEGER
});

// Create a record
const user = await User.create({ name: 'Alice', email: 'alice@example.com', age: 30 });

// Query with conditions
const admins = await User.findAll({ where: { role: 'admin' }, order: [['name', 'ASC']] });

// Update
await User.update({ age: 31 }, { where: { email: 'alice@example.com' } });

// Associations
const Post = sequelize.define('Post', { title: DataTypes.STRING });
User.hasMany(Post);
Post.belongsTo(User);
```

### Prisma (Node.js / TypeScript)

```typescript
// schema.prisma
// model User {
//   id    Int     @id @default(autoincrement())
//   name  String
//   email String  @unique
//   posts Post[]
// }

// Type-safe queries
const user = await prisma.user.create({
    data: { name: 'Alice', email: 'alice@example.com' }
});

const usersWithPosts = await prisma.user.findMany({
    include: { posts: true },
    where: { email: { contains: '@example.com' } }
});
```

### SQLAlchemy (Python)

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, Session

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True)

engine = create_engine('postgresql://user:pass@localhost/mydb')
Base.metadata.create_all(engine)

with Session(engine) as session:
    user = User(name='Alice', email='alice@example.com')
    session.add(user)
    session.commit()

    users = session.query(User).filter(User.name.like('A%')).all()
```

### Hibernate (Java)

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Post> posts;
}

// Usage with EntityManager
User user = new User();
user.setName("Alice");
user.setEmail("alice@example.com");
entityManager.persist(user);

List<User> users = entityManager
    .createQuery("SELECT u FROM User u WHERE u.name LIKE :name", User.class)
    .setParameter("name", "A%")
    .getResultList();
```

## Pros of Using ORMs

- **Productivity**: Write less boilerplate code; focus on business logic.
- **Portability**: Switch databases with minimal code changes.
- **Type Safety**: Many ORMs (Prisma, Hibernate) provide compile-time checks.
- **Security**: Built-in protection against SQL injection via parameterized queries.
- **Migrations**: Most ORMs include schema migration tools.
- **Relationships**: Easy handling of associations (one-to-many, many-to-many).

## Cons of Using ORMs

- **Performance Overhead**: Generated queries may not be optimal; the N+1 query problem is common.
- **Abstraction Leaks**: Complex queries often require dropping down to raw SQL.
- **Learning Curve**: Each ORM has its own API, configuration, and conventions to learn.
- **Debugging Difficulty**: Troubleshooting generated SQL can be harder than debugging hand-written queries.
- **Limited Control**: Some database-specific features are inaccessible through the ORM.

## The N+1 Query Problem

One of the most common performance pitfalls with ORMs:

```javascript
// Bad: N+1 queries (1 query for users + N queries for posts)
const users = await User.findAll();
for (const user of users) {
    const posts = await user.getPosts(); // One query per user
}

// Good: Eager loading (2 queries total)
const users = await User.findAll({ include: [Post] });
```

## When to Use an ORM

- **Use an ORM** for CRUD-heavy applications, rapid prototyping, and when your team prefers working with objects over SQL.
- **Use raw SQL or a query builder** for performance-critical queries, complex reporting, and when you need full control over the generated SQL.
- **Hybrid approach**: Use an ORM for standard operations and drop down to raw SQL for complex cases. Most ORMs support this.

## Resources

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Hibernate ORM Documentation](https://hibernate.org/orm/documentation/)
- [ORM Anti-Patterns](https://martinfowler.com/bliki/OrmHate.html)
