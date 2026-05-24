# 03 - Backend API and Business Rules

## 1. API Areas

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Competition

- `GET /api/competition/overview`
- `GET /api/competition/rounds`
- `POST /api/competition/rounds/:roundId/initiate` (ADMIN)
- `POST /api/competition/rounds/:roundId/simulate` (ADMIN)

### Teams / Players / Matches / Users

- Team, player, match, and admin user management endpoints exist under `/api/teams`, `/api/players`, `/api/matches`, `/api/users`.

## 2. Key Business Rules

### 2.1 Round Initiation

- Round must exist.
- Previous round must be fully completed (except first round).
- Matches must have both teams known.
- Matches in that round move from `NOT_STARTED` to `IN_PROGRESS`.

### 2.2 Round Simulation

- Round cannot be simulated if NOT_STARTED matches remain.
- Teams must be assigned to matches.
- Simulation generates non-draw outcomes and goal events.

### 2.3 Match Update Rules

- Only ADMIN or assigned REFEREE can update match status/result/goals.
- `IN_PROGRESS` and `COMPLETED` require known teams.
- `COMPLETED` requires valid score and non-draw result.

### 2.4 Goal Rules

- Goal player must exist.
- Goal team must match selected player's team.
- Goal team must be one of the match teams.
- Player must be `AVAILABLE`.

## 3. Security Model

- JWT is validated on protected routes.
- Route-level role checks block unauthorized actions.
- Service-level checks enforce ownership/context (for referee actions).

## 4. Error Strategy

The backend uses typed errors:

- ValidationError
- NotFoundError
- ForbiddenError
- UnauthorizedError

This keeps API responses consistent and easy for frontend handling.

## 5. Case-Insensitive Login Behavior

Username matching for login is case-insensitive in service lookup.
This improves usability while preserving unique identity semantics.

## 6. Swagger As API Contract

Swagger UI (`/api-docs`) reflects endpoint contracts and should be used by:

- frontend development
- testing
- demos and evaluation
