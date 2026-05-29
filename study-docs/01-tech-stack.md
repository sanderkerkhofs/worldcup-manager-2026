# 01 — Technology Stack

> **Every tool used in this project, explained in plain language.**

---

## What is a "tech stack"?

A **tech stack** is the collection of technologies (programming languages, frameworks, libraries, databases, tools) that together make an application work. Think of it like the ingredients of a recipe — each one plays a specific role.

This project is a **full-stack web application**: it has a **back-end** (server + database) and a **front-end** (the website the user sees).

---

## Big picture overview

```
Browser (user)
   │
   ▼
Next.js (React) ← front-end, runs on port 8080
   │  HTTP requests
   ▼
Express.js API ← back-end, runs on port 3001
   │  Prisma ORM
   ▼
PostgreSQL ← database, runs on port 5432
```

All three pieces run together via **Docker**.

---

## Language: TypeScript

|                    |                                            |
| ------------------ | ------------------------------------------ |
| **What it is**     | A superset of JavaScript that adds _types_ |
| **Why it matters** | Catches bugs before you run the code       |
| **Used in**        | Both back-end and front-end                |

JavaScript is a very flexible language — you can pass any kind of value anywhere. That flexibility is also a source of bugs. TypeScript adds **type annotations** so you (and the editor) know exactly what shape every piece of data should have.

```ts
// Plain JavaScript — no type info, easy to make mistakes
function greet(name) {
  return "Hello " + name;
}

// TypeScript — you declare that name MUST be a string
function greet(name: string): string {
  return "Hello " + name;
}
```

When you run `tsc` (the TypeScript compiler) or use tools like `ts-node`, TypeScript is **compiled** into regular JavaScript that the browser or Node.js can actually run.

---

## Back-end

### Node.js

Node.js lets you run JavaScript/TypeScript **outside the browser**, on a server. It is event-driven and non-blocking, meaning it can handle many requests at the same time without freezing.

### Express.js

Express is a minimal web **framework** for Node.js. It makes it easy to:

- Define routes (URLs the server responds to)
- Read request bodies (JSON data sent by the client)
- Send responses back

```ts
// A simple Express route
app.get("/status", (req, res) => {
  res.json({ message: "Back-end is running..." });
});
```

In your project, `back-end/app.ts` is the **entry point** that creates the Express app and registers all routes.

### Key back-end libraries

| Library              | Role                                                        |
| -------------------- | ----------------------------------------------------------- |
| `express`            | Web server framework                                        |
| `cors`               | Allows the front-end (different port) to call the API       |
| `helmet`             | Adds security HTTP headers automatically                    |
| `body-parser`        | Reads JSON request bodies                                   |
| `jsonwebtoken`       | Creates and verifies JWT tokens (login sessions)            |
| `bcrypt`             | Hashes passwords so they are never stored in plain text     |
| `prisma`             | Database ORM — lets you talk to PostgreSQL using TypeScript |
| `swagger-ui-express` | Auto-generates interactive API documentation                |
| `dotenv`             | Loads environment variables from a `.env` file              |
| `nodemon`            | Restarts the server automatically when you save a file      |

---

## Database

### PostgreSQL

PostgreSQL is a **relational database** — data is stored in tables (like spreadsheets) with rows and columns, and tables can reference each other.

Your database stores: Users, Teams, Players, Matches, Goals.

### Prisma

Prisma is an **ORM** (Object-Relational Mapper). Instead of writing raw SQL queries, you write TypeScript:

```ts
// Without Prisma (raw SQL)
const result = await db.query("SELECT * FROM users WHERE id = $1", [userId]);

// With Prisma (TypeScript)
const user = await prisma.user.findUnique({ where: { id: userId } });
```

Prisma reads your `schema.prisma` file (which defines your database tables) and generates TypeScript types for every model automatically.

---

## Front-end

### React

React is a JavaScript **library** for building user interfaces. Instead of manually manipulating the HTML DOM, you write **components** — reusable pieces of UI that automatically update when data changes.

```tsx
// A simple React component
function WelcomeCard({ username }: { username: string }) {
  return (
    <div className="card">
      <h2>Hello, {username}!</h2>
    </div>
  );
}
```

### Next.js

Next.js is a **framework built on top of React**. It adds:

- **File-based routing** — every file in `pages/` becomes a URL automatically
- **Server-side rendering** — pages can be pre-rendered on the server for speed
- **Built-in API support** — though this project uses a separate Express API

In your project, `front-end/pages/index.tsx` = `http://localhost:8080/`, `pages/login.tsx` = `/login`, etc.

### SWR (data fetching)

SWR is a React library for **fetching data** from an API. The name stands for **stale-while-revalidate** — a strategy where it shows cached (old) data immediately, then quietly re-fetches fresh data in the background.

```ts
// useSWR(key, fetcher)
const { data, isLoading, error } = useSWR("overview", () => getOverview(token));
```

### Key front-end libraries

| Library                          | Role                                 |
| -------------------------------- | ------------------------------------ |
| `next`                           | React framework with routing & SSR   |
| `react`                          | UI component library                 |
| `swr`                            | Data fetching with automatic caching |
| `i18next` / `react-i18next`      | Translations (NL / EN / FR)          |
| `bootstrap`                      | CSS utility classes for layout       |
| `tailwindcss`                    | Utility-first CSS framework          |
| `dayjs`                          | Date formatting                      |
| `@fortawesome/react-fontawesome` | Icons                                |

---

## DevOps / Deployment

### Docker

Docker **packages** your application (code + dependencies + configuration) into a **container** — a lightweight, isolated environment that runs the same everywhere.

### Docker Compose

Docker Compose lets you define and run **multiple containers** together using a YAML file. Your `docker-compose-fullstack.yml` starts three containers:

1. `database` — PostgreSQL
2. `backend` — Express API
3. `frontend` — Next.js

```yaml
# excerpt from docker-compose-fullstack.yml
services:
  database:
    image: postgres:16-alpine # uses the official Postgres image
  backend:
    build: ./back-end # builds using the back-end Dockerfile
    depends_on: [database] # waits for DB to be healthy first
  frontend:
    build: ./front-end # builds using the front-end Dockerfile
```

### Why Docker?

Without Docker, every developer needs to install PostgreSQL, Node.js, configure environment variables, etc. on their own machine. With Docker, you just run `docker compose up` and everything starts.

---

## Testing

### Jest

Jest is a JavaScript **testing framework**. You write test cases that describe expected behavior, and Jest tells you if any of them fail.

```ts
// from back-end/test/domain.test.ts
it('rejects an empty team name', () => {
  expect(() => new Team({ name: '   ', ... })).toThrow('Team name is required.');
});
```

The tests in this project test the **domain model classes** (Team, Player, Match) to make sure validation rules work correctly.

---

## Summary table

| Technology       | Category         | Where used           |
| ---------------- | ---------------- | -------------------- |
| TypeScript       | Language         | Back-end + Front-end |
| Node.js          | Runtime          | Back-end             |
| Express.js       | Web framework    | Back-end             |
| Prisma           | ORM              | Back-end             |
| PostgreSQL       | Database         | Back-end             |
| Next.js          | React framework  | Front-end            |
| React            | UI library       | Front-end            |
| SWR              | Data fetching    | Front-end            |
| JWT              | Authentication   | Both                 |
| bcrypt           | Password hashing | Back-end             |
| Docker / Compose | Deployment       | Infra                |
| Jest             | Testing          | Back-end             |
