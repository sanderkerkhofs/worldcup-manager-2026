# World Cup Manager 2026

A full-stack learning project for managing a FIFA World Cup 2026-style knockout football tournament.

## Overview

World Cup Manager 2026 is a tournament management system with:

- **Backend**: Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: Next.js + React + TypeScript
- **Role-Based Access**: Admin, Referee, User, Guest
- **Features**: Tournament simulation, match lifecycle management, goal tracking, top-scorer rankings

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Backend Setup

```bash
cd back-end
npm install
npm run db:generate
npm run db:seed
npm start
```

Backend runs on `http://localhost:3000`

### 3. Frontend Setup

In a new terminal:

```bash
cd front-end
npm install
npm run dev
```

Frontend runs on `http://localhost:8080`

## Demo Accounts

The seed script creates these accounts for testing:

| Username             | Password      | Role    | Team          |
| -------------------- | ------------- | ------- | ------------- |
| `admin`              | `admin123`    | ADMIN   | —             |
| `greetjej`           | `greetjej123` | USER    | Belgium (BEL) |
| `elkes`              | `elkes123`    | USER    | Belgium (BEL) |
| `johanp`             | `johanp123`   | USER    | Belgium (BEL) |
| `Frank_De_Bleeckere` | `referee123`  | REFEREE | Belgium (BEL) |

## Useful URLs

| Purpose          | URL                              |
| ---------------- | -------------------------------- |
| Backend Status   | `http://localhost:3000/status`   |
| Swagger API Docs | `http://localhost:3000/api-docs` |
| Frontend App     | `http://localhost:8080`          |

## Core Workflows

### Admin: Simulate Tournament Round

1. Navigate to Admin panel (`/admin`)
2. Click "Simulate Round" for current round
3. System auto-generates non-draw match results
4. Winners automatically advance to next round
5. Repeat for all rounds (8th Final → Quarterfinal → Semifinal → Final)

### Referee: Update Match Results

1. Login as referee
2. Navigate to Referee panel (`/referee`)
3. Select assigned match from queue
4. Update match status: NOT_STARTED → IN_PROGRESS → FINISHED
5. Enter final score and goal scorers
6. Submit (system prevents draws in knockout)

### User: View Tournament & Stats

1. Login as user
2. View current round fixtures on dashboard
3. Check standings and top-scorer rankings
4. Watch tournament progress live

## Project Structure

```
/
├── back-end/                  # Express API, Prisma, services, models
│   ├── controller/           # Route handlers
│   ├── service/              # Business logic
│   ├── model/                # Domain models (validation)
│   ├── repository/prisma/    # Prisma schema & migrations
│   ├── util/                 # Auth, middleware, errors
│   ├── test/                 # Jest unit tests
│   └── app.ts                # Express app setup
├── front-end/                # Next.js app
│   ├── pages/               # Routes & page components
│   ├── components/          # Reusable UI components
│   ├── services/            # API client functions
│   ├── lib/                 # Utilities (session, i18n, matching)
│   └── styles/              # Tailwind & global CSS
├── analysis/                 # School analysis deliverables
│   ├── project_plan.md      # Original plan
│   ├── user_stories.md      # Acceptance criteria
│   └── *.drawio             # Architecture & ER diagrams
├── documenation/            # Documentation
│   ├── project-documentation.md
│   ├── 01-architecture.md
│   ├── 02-data-model-erd.md
│   ├── 03-backend-api-rules.md
│   └── 04-frontend-state-ui.md
└── docker-compose-*.yml    # PostgreSQL services
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create USER account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Competition

- `GET /api/competition` - Overview & standings
- `GET /api/competition/rounds` - All rounds
- `POST /api/competition/rounds/:roundId/simulate` - Simulate round (ADMIN)
- `POST /api/competition/reset-matches` - Reset tournament (ADMIN)

### Matches

- `GET /api/matches` - All matches
- `GET /api/matches/top-scorers` - Goal rankings
- `GET /api/matches/:matchId` - Match details
- `PATCH /api/matches/:matchId/status` - Update status
- `PUT /api/matches/:matchId/result` - Update score
- `POST /api/matches/:matchId/goals` - Add goal
- `PATCH /api/matches/:matchId/goals/:goalId` - Edit goal

### Players & Users

- `GET /api/players` - All players
- `GET /api/players/:playerId` - Player details
- `GET /api/users` - All users (ADMIN)
- `DELETE /api/users/:userId` - Delete user (ADMIN)

See [Swagger UI](http://localhost:3000/api-docs) for complete API specification.

## Key Features

### Tournament Simulation

- Auto-generate realistic match results (no draws)
- Automatic winner advancement to next round
- Repeatable simulation for testing

### Match Management

- Status tracking (PLANNED → NOT_STARTED → IN_PROGRESS → FINISHED)
- Goal scoring with player attribution
- Referee-only or admin access based on assignment

### Role-Based Access

- **ADMIN**: Full system control (simulate, reset, user management)
- **REFEREE**: Update assigned matches only
- **USER**: Read-only authenticated access
- **GUEST**: Limited public access

### Tournament Progress

- 4-round knockout format (8th Final → Quarterfinal → Semifinal → Final)
- Top-scorer rankings updated live
- Team standings and statistics

## Documentation

Full documentation available in `/documenation/`:

1. **[01-architecture.md](documenation/01-architecture.md)** - System design overview
2. **[02-data-model-erd.md](documenation/02-data-model-erd.md)** - Database schema
3. **[03-backend-api-rules.md](documenation/03-backend-api-rules.md)** - API reference & business rules
4. **[04-frontend-state-ui.md](documenation/04-frontend-state-ui.md)** - Frontend architecture
5. **[project-documentation.md](documenation/project-documentation.md)** - Complete overview

See [Swagger UI](http://localhost:3000/api-docs) for live API documentation.

## Testing

### Run Backend Tests

```bash
cd back-end
npm test
npm run test:coverage
```

Tests cover:

- Domain model validation
- Service business logic
- Error handling

## Environment Setup

### Backend (.env)

```env
APP_PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/tournament_db
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:8080,http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Tech Stack Details

| Layer        | Technology               | Version |
| ------------ | ------------------------ | ------- |
| **Backend**  | Node.js + Express        | v18+    |
| **API**      | TypeScript + Swagger     | 4.x     |
| **Database** | PostgreSQL               | 14+     |
| **ORM**      | Prisma                   | 5.x     |
| **Frontend** | Next.js + React          | 13+     |
| **Styling**  | Tailwind CSS + Bootstrap | 5.x     |
| **Testing**  | Jest                     | 29.x    |

## Learning Focus

This project demonstrates:

- **Layered architecture** (Controllers → Services → Domain Models → Repository)
- **Type-safe API contracts** (TypeScript DTOs, Swagger)
- **Business logic validation** (Domain models, service rules)
- **Role-based access control** (Middleware, service-level checks)
- **Database design** (Prisma schema, foreign keys, constraints)
- **React state management** (SWR hooks, session persistence)
- **Responsive UI** (Tailwind CSS, Bootstrap 5)

## License

School project for UCLL Full-Stack Software Development (Semester 2)
