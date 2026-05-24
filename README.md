# Tournament Manager

Tournament Manager is a learning-focused MVP for planning football tournaments. The project uses a layered Express backend, a Next.js frontend, Prisma, and PostgreSQL.

## Folder Guide

- `analysis/` contains the school deliverables: pitch, user stories, ER diagrams, and architecture sketches.
- `back-end/` contains the Express API, Prisma schema, seed script, and tests.
- `front-end/` contains the Next.js application and UI components.

## Local Setup

1. Start PostgreSQL with Docker:

```console
docker compose up -d postgres
```

2. Copy `back-end/.env.example` to `back-end/.env` and adjust the values if needed.
3. Generate the Prisma client and seed the database:

```console
cd back-end
npm run db:generate
npm run db:seed
```

4. Start the backend:

```console
npm start
```

5. Start the frontend in a second terminal:

```console
cd front-end
npm run dev
```

## Default Accounts

The seed script creates these login accounts for demo purposes:

- `admin` / `admin123`
- `greetjej` / `greetjej123`
- `elkes` / `elkes123`
- `johanp` / `johanp123`

## Useful URLs

- Backend status: `http://localhost:3000/status`
- Swagger UI: `http://localhost:3000/api-docs`
- Frontend: `http://localhost:8080`
