# World Cup Manager 2026

A full-stack learning project for managing a FIFA World Cup 2026-style knockout football tournament.

✅ **All school requirements met**: TypeScript, Express, Next.js, Prisma, PostgreSQL, 195 tests (100% pass), complete API, full authentication.

## Overview

World Cup Manager 2026 is a tournament management system with:

- **Backend**: Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: Next.js + React + TypeScript
- **Testing**: Jest with 195 comprehensive tests (100% pass rate)
- **Role-Based Access**: Admin, Referee, User, Guest
- **Features**: Tournament simulation, match lifecycle management, goal tracking, top-scorer rankings

## Quick Links

- 📊 [Project Status & Analysis](./PROJECT_STATUS.md) - Complete project overview
- 🧪 [Testing Documentation](./back-end/TESTING.md) - Jest tests, coverage, strategy
- 📚 [Technical Documentation](./documenation/project-documentation.md) - Full API, architecture, workflows
- ✅ [Requirements Checklist](./analysis/school-requirements-checklist.md) - School requirements verification

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

## Test the System

```bash
# Backend tests (195 tests, 100% pass rate)
cd back-end
npm test              # All tests
npm test test/model   # Domain model tests only
npm test test/service # Service tests only
```

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
4. Update match status: PLANNED → NOT_STARTED → IN_PROGRESS → FINISHED
5. Enter final score and goal scorers
6. System validates data and persists results

### User: View Competition Status

1. Login with user account
2. View current round matches
3. View league standings (calculated from match results)
4. View top scorers (ranked by goals)
5. Read-only access (cannot modify data)

## Technical Highlights

### Backend Architecture

- **Layered**: Domain → Service → Controller → Routes
- **Validation**: All input validated at domain layer
- **Testing**: 195 unit tests with 100% pass rate
- **Mocking**: Factory function pattern for clean Prisma mocks

### Frontend Architecture

- **Pages Router**: Next.js pages with role-based protection
- **Components**: Reusable UI components with props
- **Services**: Isolated API client calls
- **Hooks**: useState, useEffect, useSWR for state and data

### Database

- **Schema**: 5 models with 1-to-many and many-to-many relations
- **Seeding**: 32 teams, 480+ players, 4 tournament rounds
- **Validation**: Referential integrity with cascade deletes
- **ORM**: Prisma with PostgreSQL

### Testing

- **Domain Tests**: 117 tests validating all business rules
- **Service Tests**: 78 tests covering all business logic
- **Coverage**: 100% pass rate, comprehensive error scenarios
- **Strategy**: Mocks for external dependencies (Prisma, JWT, passwords)

## Project Structure

```
.
├── back-end/
│   ├── model/           (Domain objects with validation)
│   ├── service/         (Business logic)
│   ├── controller/      (Request routing)
│   ├── test/            (195 Jest tests)
│   ├── TESTING.md       (Testing documentation)
│   └── package.json
├── front-end/
│   ├── pages/           (Role-based pages)
│   ├── components/      (Reusable UI)
│   ├── lib/             (Services & hooks)
│   └── package.json
├── documenation/
│   ├── project-documentation.md
│   ├── 01-architecture.md
│   ├── 02-data-model-erd.md
│   ├── 03-backend-api-rules.md
│   ├── 04-frontend-state-ui.md
│   ├── 05-workflows-sequences.md
│   └── 06-learning-path.md
├── analysis/
│   ├── school-requirements-checklist.md
│   ├── project-plan.md
│   ├── project-schema.md
│   └── *.drawio (architecture diagrams)
├── PROJECT_STATUS.md     (This project analysis)
└── README.md
```

## Implementation Statistics

**Codebase**:

- Backend: ~2,500 lines (models, services, controllers)
- Frontend: ~1,800 lines (pages, components, services)
- Tests: ~3,500 lines (195 tests, 12 suites)
- Documentation: ~2,000 lines (markdown files)

**API**:

- Total endpoints: 15+
- HTTP methods: GET, POST, PUT, PATCH, DELETE
- Full CRUD coverage: Teams, Players, Matches, Users
- Special operations: Simulate round, reset tournament, get standings

**Database**:

- Models: 5 (User, Team, Player, Match, Goal)
- Relations: 1-M (Team→Players), M-M (Match↔Goal)
- Seeded records: 32 teams, 480+ players, 4 rounds

**Testing**:

- Domain model tests: 117 tests (5 files)
- Service layer tests: 78 tests (6 files)
- Total: 195 tests, 100% pass rate

## School Requirements Status

✅ **All Requirements Met**:

- [x] TypeScript in backend and frontend
- [x] Express.js backend with Node.js
- [x] React + Next.js frontend (Pages Router)
- [x] Prisma ORM with PostgreSQL
- [x] Layered backend architecture (Domain → Service → Controller)
- [x] DTO type contracts in `types/index.ts`
- [x] Swagger documentation at `/api-docs`
- [x] Complete Prisma schema with relations
- [x] Seeded data (teams, players, rounds)
- [x] 195 comprehensive Jest tests (100% pass)
- [x] Frontend with components, props, hooks
- [x] Forms with validation (login, register, match results)
- [x] JWT authentication with 4 roles
- [x] Role-based access control
- [x] Browser storage for session persistence

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for complete details.

## Getting Help

- **API**: Check `/api-docs` for Swagger documentation
- **Tests**: See [back-end/TESTING.md](./back-end/TESTING.md) for testing guide
- **Architecture**: See [documenation/project-documentation.md](./documenation/project-documentation.md)
- **Requirements**: See [analysis/school-requirements-checklist.md](./analysis/school-requirements-checklist.md)

## Technology Stack Summary

| Layer                | Technology   | Version |
| -------------------- | ------------ | ------- |
| **Backend Runtime**  | Node.js      | 20.x    |
| **Backend API**      | Express.js   | 4.x     |
| **Language**         | TypeScript   | 5.x     |
| **Database ORM**     | Prisma       | 5.1.1   |
| **Database**         | PostgreSQL   | 15.x    |
| **Password Hashing** | bcrypt       | 5.1.0   |
| **Authentication**   | JWT          | Native  |
| **Frontend**         | Next.js      | 14.x    |
| **UI Framework**     | React        | 18.x    |
| **HTTP Client**      | SWR          | 2.x     |
| **Styling**          | Tailwind CSS | 3.x     |
| **Testing**          | Jest         | 29.7.0  |
| **Containerization** | Docker       | -       |

## Notes

- Database reset and reseed:
  ```bash
  cd back-end
  npm run db:seed
  ```
- This performs a force reset, then seeds fresh demo data.

- All diagrams (`.drawio` files) are editable in [diagrams.net](https://diagrams.net)

- Project follows school requirements strictly with clean implementation
  | -------------------- | ------------- | ------- | ------------- |
  | `admin` | `admin123` | ADMIN | — |
  | `greetjej` | `greetjej123` | USER | Belgium (BEL) |
  | `elkes` | `elkes123` | USER | Belgium (BEL) |
  | `johanp` | `johanp123` | USER | Belgium (BEL) |
  | `Frank_De_Bleeckere` | `referee123` | REFEREE | Belgium (BEL) |

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
