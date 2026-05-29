# Worldcup Manager 2026 — Study Documentation

> A complete guide to understanding, explaining, and presenting this full-stack web application.  
> Written for beginners — every concept is explained from scratch.

---

## What is this project?

**Worldcup Manager 2026** is a full-stack web application for managing a football World Cup knockout tournament:

- An **administrator** manages teams, players, users, and the tournament structure
- **Referees** update match statuses and record goals for their assigned matches
- Registered **fans** follow matches, standings, and top scorers
- The system **automatically advances the bracket** when a round is completed

---

## Technology at a glance

| Category        | Technology                        |
| --------------- | --------------------------------- |
| Language        | TypeScript (back-end + front-end) |
| Back-end Server | Node.js + Express                 |
| Database        | PostgreSQL                        |
| DB Access       | Prisma ORM                        |
| Front-end       | Next.js + React                   |
| Authentication  | JWT + bcrypt                      |
| Data Fetching   | SWR                               |
| Deployment      | Docker Compose                    |
| Testing         | Jest                              |

---

## How to run the project

### Full Docker (recommended)

```bash
# From the project root:
docker compose -f docker-compose-fullstack.yml up --build

# Front-end  → http://localhost:8080
# Back-end   → http://localhost:3001
# Swagger    → http://localhost:3001/api-docs
```

### Seed the database (after starting)

```bash
docker compose exec backend npm run db:seed
```

### Test accounts (after seeding)

| Username   | Password     | Role    |
| ---------- | ------------ | ------- |
| `admin`    | `admin123`   | ADMIN   |
| `referee1` | `referee123` | REFEREE |
| `user1`    | `user123`    | USER    |

> Check `back-end/util/seed.ts` for exact seeded usernames and passwords.

---

## Project file structure

```
project-sem-2-sanderkerkhofs/
├── back-end/                    ← Express API server
│   ├── app.ts                   ← Entry point
│   ├── controller/              ← HTTP route handlers (Layer 1)
│   ├── service/                 ← Business logic (Layer 2)
│   ├── repository/prisma/       ← DB client + schema (Layer 3)
│   ├── model/                   ← Domain classes with validation (Layer 4)
│   ├── util/                    ← JWT, bcrypt, middleware, errors
│   └── test/                    ← Jest unit tests
│
├── front-end/                   ← Next.js web application
│   ├── pages/                   ← One file = one URL route
│   ├── components/              ← Reusable UI pieces
│   ├── services/                ← API call functions
│   └── lib/                     ← Session, i18n, API client
│
├── docker-compose-fullstack.yml ← Starts all 3 services
├── docker-compose-pgsql.yml     ← Starts only the database
└── study-docs/                  ← ← YOU ARE HERE
```

---

## Study chapters

| Chapter | File                                                     | Topic                                         |
| ------- | -------------------------------------------------------- | --------------------------------------------- |
| 01      | [01-tech-stack.md](01-tech-stack.md)                     | Every library and framework explained         |
| 02      | [02-backend-architecture.md](02-backend-architecture.md) | 4-layer pattern, middleware, request flow     |
| 03      | [03-database-prisma.md](03-database-prisma.md)           | Data model, Prisma schema, CRUD, transactions |
| 04      | [04-authentication.md](04-authentication.md)             | bcrypt, JWT, RBAC, Helmet, CORS               |
| 05      | [05-frontend-nextjs.md](05-frontend-nextjs.md)           | React hooks, SWR, i18n, role-based access     |
| 06      | [06-api-endpoints.md](06-api-endpoints.md)               | Every REST endpoint documented                |
| 07      | [07-docker-deployment.md](07-docker-deployment.md)       | Containers, Dockerfiles, docker-compose       |
| 08      | [08-qa-presentation.md](08-qa-presentation.md)           | 30+ practice Q&A for your presentation        |

---

## Suggested study order

1. **Tech Stack** — understand what each tool is
2. **Backend Architecture** — how the server is organised
3. **Database & Prisma** — how data is stored
4. **Authentication** — often heavily examined
5. **Frontend** — the React side
6. **API Endpoints** — know what each endpoint does
7. **Docker** — how to start the project and why Docker is used
8. **Q&A** — spend the most time here, practice out loud!

---

## Presentation tip

When asked about code you wrote with AI assistance, focus on showing that you _understand what the code does_. Be able to explain: what problem does this code solve? What would happen if it wasn't there? What are the key concepts it uses? That understanding is what matters.
