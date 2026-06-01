# 03 - Backend API and Business Rules

## 1. API Areas

### Auth

- `POST /api/auth/register` - Create new USER account
- `POST /api/auth/login` - Login (any role)
- `GET /api/auth/me` - Get current authenticated user

### Competition

- `GET /api/competition` - Overview with all teams, rounds, matches (statistics visible to authenticated users only)
- `GET /api/competition/rounds` - List of all rounds with match counts
- `POST /api/competition/rounds/:roundId/simulate` (ADMIN) - Simulate a round with auto-generated results
- `POST /api/competition/reset-matches` (ADMIN) - Reset all matches to initial state

Note: `roundId` is a numeric stage identifier (1-4) or stage name, not a database `Round` row id.

Statistics (standings, top scorers) are computed for all users but only displayed on frontend for authenticated users (ADMIN, REFEREE, USER).

### Teams / Players / Matches / Users

- Team, player, match, and admin user management endpoints exist under `/api/teams`, `/api/players`, `/api/matches`, `/api/users`.

## 2. Key Business Rules

### 2.1 Match Status Lifecycle

- All matches start as `PLANNED` (seeded)
- Referee or Admin can move to `NOT_STARTED` (match initiated)
- Referee can move to `IN_PROGRESS` (match started)
- Referee can move to `FINISHED` (match completed with score)
- Admin can manually transition or use simulate to auto-progress
- Referees have restricted transitions (cannot directly to FINISHED, must go through IN_PROGRESS)

### 2.2 Stage Simulation (Admin Only)

- Admin calls simulate on a stage (roundId)
- System validates previous stage is fully `FINISHED` (or is first stage)
- System auto-generates non-draw results for all matches
- System creates Goal records for each generated goal
- System marks all matches as `FINISHED`
- System auto-populates next stage teams from winners
- Can be called multiple times to regenerate results (for testing)

### 2.3 Match Update Rules

- Only ADMIN or assigned REFEREE can update match status/result/goals
- For non-first rounds, edits are blocked until all previous-round matches are `FINISHED`
- `IN_PROGRESS` and `FINISHED` require known teams assigned to match
- `FINISHED` requires valid score and non-draw result
- Referees have restricted status transitions (cannot set to NOT_STARTED if already IN_PROGRESS)

### 2.4 Goal Rules

- Goal player must exist in the system
- Goal team must match selected player's team
- Goal team must be one of the match's home/away teams

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

## 6. Match Status Values

The implementation uses these standardized statuses:

- `PLANNED` - initial seeded state
- `NOT_STARTED` - match initiated, ready to start
- `IN_PROGRESS` - match in progress
- `FINISHED` - match completed with final score

Note: Some documentation may reference `COMPLETED` which is equivalent to `FINISHED` in the implementation.

Username matching for login is case-insensitive in service lookup.
This improves usability while preserving unique identity semantics.

## 7. Swagger As API Contract

Swagger UI (`/api-docs`) reflects endpoint contracts and should be used by:

- frontend development
- testing
- demos and evaluation
