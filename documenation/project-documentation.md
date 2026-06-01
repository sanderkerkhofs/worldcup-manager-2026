# Tournament Manager Documentation

## 1. Project Overview

Tournament Manager is a full-stack learning project for managing a football knockout competition.

It includes:

- A layered Express + TypeScript backend
- A Next.js + TypeScript frontend
- Prisma ORM with PostgreSQL
- Seeded demo data and role-based workflows

Primary goal:

- Manage knockout stages, matches, players, and competition flow with role-based access.

## 2. Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT authentication
- Swagger (OpenAPI)

### Frontend

- Next.js (Pages Router)
- React
- TypeScript
- SWR for data fetching

### Infra / Tooling

- Docker Compose (PostgreSQL)
- Jest (backend tests)

## 3. Repository Structure

- `analysis/`: school analysis and planning artifacts
- `back-end/`: API, services, domain models, Prisma schema, seed script
- `front-end/`: UI pages, components, client services, styles
- `docker-compose.yml`: local PostgreSQL service definition

## 4. Core Domain Model

Main entities:

- User: roles ADMIN, REFEREE, GUEST
- Team: national team with country metadata
- Player: belongs to a team
- Match: fixture between two teams with status and embedded stage metadata (`roundOrderNumber`, `roundName`)
- Goal: goal events tied to a match/player/team

Match statuses:

- NOT_STARTED
- IN_PROGRESS
- COMPLETED

## 5. Roles and Access

- ADMIN:
  - Manage users
  - Initiate and simulate stages
  - Edit match status/results/goals
- REFEREE:
  - Update assigned match status/results/goals
- GUEST:
  - Read-only/public browsing where allowed

## 6. Main Workflows

### 6.1 Competition Progression

1. First-stage matches are seeded as IN_PROGRESS.
2. Referees/Admin update scores and goals.
3. Matches are completed.
4. Next-stage matches are auto-filled with winners.
5. Next-stage matches become IN_PROGRESS automatically.

### 6.2 Match Editing

- Update status
- Update score
- Add or edit goals
- Validation ensures:
  - teams exist when required
  - no draw for knockout completion
  - valid player IDs for goal registration

## 7. API Surface (High-Level)

Base URL: `http://localhost:3000`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Competition

- `GET /api/competition`
- `GET /api/competition/rounds`
- `POST /api/competition/rounds/:roundId/simulate` (ADMIN)

Note: `roundId` is a stage identifier in API routes and responses, not a persisted `Round` table primary key.

### Teams

- `GET /api/teams`
- `GET /api/teams/:teamId`
- `GET /api/teams/:teamId/players`
- `POST /api/teams` (ADMIN)
- `PUT /api/teams/:teamId` (ADMIN)
- `DELETE /api/teams/:teamId` (ADMIN)

### Players

- `GET /api/players`
- `GET /api/players/:playerId`
- `POST /api/players` (ADMIN)
- `PUT /api/players/:playerId` (ADMIN)
- `DELETE /api/players/:playerId` (ADMIN)

### Matches

- `GET /api/matches`
- `GET /api/matches/top-scorers`
- `GET /api/matches/:matchId`
- `PATCH /api/matches/:matchId/status` (ADMIN/REFEREE)
- `PUT /api/matches/:matchId/result` (ADMIN/REFEREE)
- `POST /api/matches/:matchId/goals` (ADMIN/REFEREE)
- `PATCH /api/matches/:matchId/goals/:goalId` (ADMIN/REFEREE)

### Users (Admin)

- `GET /api/users`
- `DELETE /api/users/:userId`

Swagger UI:

- `http://localhost:3000/api-docs`

## 8. Local Setup

1. Start PostgreSQL:

```console
docker compose up -d postgres
```

2. Backend setup:

```console
cd back-end
npm install
npm run db:generate
npm run db:seed
npm start
```

3. Frontend setup:

```console
cd front-end
npm install
npm run dev
```

4. Open app:

- Frontend: `http://localhost:8080`

## 9. Seeded Example Accounts

- admin / admin123
- Frank_De_Bleeckere / referee123 (referee example)

## 10. Quality and Validation

- Backend domain tests: Jest
- Frontend build verification: Next.js build
- Runtime API docs: Swagger

## 11. Notes

- Database reset and reseed can be done with backend script:

```console
npm run db:seed
```

- This performs a force reset, then seeds fresh demo data.
