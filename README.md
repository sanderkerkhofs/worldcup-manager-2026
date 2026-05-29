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

1. Copy `back-end/.env.example` to `back-end/.env` and adjust the values if needed.
1. Generate the Prisma client and seed the database:

```console
cd back-end
npm run db:generate
npm run db:seed
```

1. Start the backend:

```console
npm start
```

1. Start the frontend in a second terminal:

```console
cd front-end
npm run dev
```

## Default Accounts

The seed script creates these login accounts for demo purposes:

- `admin` / `admin123`
- `greetjej` / `greetjej123` (user, BEL)
- `elkes` / `elkes123` (user, BEL)
- `johanp` / `johanp123` (user, BEL)

Example coach login:

- `Domenico_Tedesco` / `coach123` (BEL, COACH, Belgium)

Example referee login:

- `Frank_De_Bleeckere` / `referee123` (BEL, REFEREE, Belgium)

## Useful URLs

- Backend status: `http://localhost:3000/status`
- Swagger UI: `http://localhost:3000/api-docs`
- Frontend: `http://localhost:8080`

## Study Documentation

- Main HTML guide: `documenation/project-documentation.html`
- Documentation index: `documenation/index.html`
