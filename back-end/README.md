# Back-end

This folder contains the Express API for Tournament Manager.

## What is here

- `app.ts` bootstraps Express, CORS, Helmet, Swagger, and the route modules.
- `controller/` contains the HTTP routers.
- `service/` contains business rules and workflow validation.
- `repository/` wraps Prisma queries.
- `model/` contains the domain entities and validation.
- `types/` contains the shared DTO and response contracts.
- `util/seed.ts` loads the database with demo users, teams, and precreated knockout matches that include round metadata.

## Setup

1. Start PostgreSQL with `docker compose up -d postgres` from the repository root.
2. Copy `.env.example` to `.env` and keep the local database URL.
3. Install dependencies if needed:

```console
npm install
```

1. Generate the Prisma client and seed the database:

```console
npm run db:generate
npm run db:seed
```

1. Start the server:

```console
npm start
```

## Verification

- Status endpoint: `GET /status`
- Swagger UI: `GET /api-docs`
- Demo API data comes from PostgreSQL, not from hardcoded arrays.
