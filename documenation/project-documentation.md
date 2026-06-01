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
- `docker-compose-*.yml`: local PostgreSQL service definitions

## 4. Core Domain Model

Main entities:

- User: roles ADMIN, REFEREE, USER (authenticated), GUEST (unauthenticated)
- Team: national team with country metadata
- Player: belongs to a team
- Match: fixture between two teams with status and embedded stage metadata (`roundOrderNumber`, `roundName`)
- Goal: goal events tied to a match/player/team

Match statuses:

- PLANNED (initial, pre-created)
- NOT_STARTED (initiated by referee or simulation)
- IN_PROGRESS (match in play)
- FINISHED (match completed)

## 5. Roles and Access

- ADMIN:
  - Simulate stages to progress tournament
  - Reset all matches to restart tournament
  - Manage users (list, delete)
  - Update any match result or goals
- REFEREE (authenticated):
  - Update assigned match status/results/goals
  - Change status only within allowed transitions
  - View tournament data (standings, top scorers)
- USER (authenticated):
  - View current round and matches
  - View statistics (standings, top scorers)
  - Read-only tournament access
- GUEST (unauthenticated):
  - View current round fixtures only
  - Access to login/register pages

## 6. Tournament Simulation Flow

### 6.1 Round Simulation (Admin)

1. Admin clicks "Simulate Round" for a round
2. System validates previous round is complete (or is first round)
3. System generates non-draw results for all matches in the round
4. System creates Goal records from the generated results
5. System auto-populates next round teams from winners
6. All matches in round marked as FINISHED
7. Next round is ready for simulation

### 6.2 Referee Match Update Flow

1. Referee navigates to assigned match
2. Referee sets match status through allowed transitions (PLANNED → NOT_STARTED → IN_PROGRESS → FINISHED)
3. For FINISHED status, referee must provide final score and goals
4. System validates no previous-round edits after current round has progressed
5. System validates goal scorers belong to correct teams
6. Results are persisted with scored-by-player data

### 6.3 Reset Workflow

1. Admin clicks "Reset Matches"
2. All matches cleared to PLANNED state
3. All goals removed
4. First-stage matches remain seeded with teams assigned
5. Tournament can be re-simulated from beginning

### 6.4 Match Editing (ADMIN/Assigned REFEREE)

Actions available:

- Update status (with transition validation)
- Update score
- Add goals with scored-by-player data
- Edit existing goals

Validation ensures:

- Teams exist when required
- No draw result for knockout completion (one team must have higher score)
- Valid player IDs belong to correct teams
- Goal scorers are from the match's home or away team

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
