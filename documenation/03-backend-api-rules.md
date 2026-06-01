# 03 - Backend API and Business Rules

## 1. Complete API Reference

Base URL: `http://localhost:3000`

### 1.1 Authentication

- `POST /api/auth/register` - Create new USER account (public)
  - Body: `{ username: string, password: string }`
  - Response: `{ user: { id, username, role }, token: string }`

- `POST /api/auth/login` - Login (any role, public)
  - Body: `{ username: string, password: string }`
  - Response: `{ user: { id, username, role }, token: string }`
  - Note: Username lookup is case-insensitive

- `GET /api/auth/me` - Get current authenticated user (requires JWT)
  - Response: `{ id, username, role, createdAt, updatedAt }`

### 1.2 Competition / Tournament

- `GET /api/competition` - Overview with all teams, rounds, matches (public)
  - Response: Teams array, rounds array, matches array, standings, topScorers
  - Note: Statistics only visible in frontend for authenticated users

- `GET /api/competition/rounds` - List all rounds with match counts (public)
  - Response: Array of rounds with roundOrderNumber, roundName, matchCount

- `POST /api/competition/rounds/:roundId/simulate` (ADMIN only)
  - URL: `/api/competition/rounds/1/simulate` or `/api/competition/rounds/quarterFinal/simulate`
  - Response: Simulated round details with matches and generated results
  - Actions: Auto-generates non-draw results, creates Goal records, advances winners to next round

- `POST /api/competition/reset-matches` (ADMIN only)
  - Response: Confirmation of reset
  - Actions: Clears all matches to PLANNED, removes all goals

### 1.3 Matches

- `GET /api/matches` - List all matches with results (public)
  - Query: optional filters
  - Response: Array of matches with all details

- `GET /api/matches/top-scorers` - Top scorers ranking (public)
  - Response: Array of players with goal count, sorted descending

- `GET /api/matches/:matchId` - Get specific match (public)
  - Response: Match details with score, goals, teams, status

- `PATCH /api/matches/:matchId/status` (ADMIN/assigned REFEREE)
  - Body: `{ status: "NOT_STARTED" | "IN_PROGRESS" | "FINISHED" }`
  - Response: Updated match
  - Restrictions: Referees can only update assigned matches

- `PUT /api/matches/:matchId/result` (ADMIN/assigned REFEREE)
  - Body: `{ homeScore: number, awayScore: number }`
  - Response: Updated match
  - Restrictions: Referees can only update assigned matches; no draw allowed

- `POST /api/matches/:matchId/goals` (ADMIN/assigned REFEREE)
  - Body: `{ playerId: string, teamId: string, scoredMinute?: number }`
  - Response: Created goal (201)
  - Restrictions: Player must belong to the goal team; team must be in match

- `PATCH /api/matches/:matchId/goals/:goalId` (ADMIN/assigned REFEREE)
  - Body: `{ playerId: string, teamId: string, scoredMinute?: number }`
  - Response: Updated goal
  - Restrictions: Referees can only update goals in assigned matches

### 1.4 Players

- `GET /api/players` - List all players (public)
  - Query: `?teamId=<teamId>` to filter by team
  - Response: Array of players with names, shirt numbers, positions

- `GET /api/players/:playerId` - Get specific player (public)
  - Response: Player details with team information

### 1.5 Users (Admin only)

- `GET /api/users` (ADMIN only)
  - Response: Array of all users with roles

- `DELETE /api/users/:userId` (ADMIN only)
  - Response: 204 No Content
  - Restrictions: Admin cannot delete themselves

## 2. Key Business Rules

### 2.1 Match Status Lifecycle

All matches start as `PLANNED` (seeded at database initialization).

Valid transitions:

- PLANNED → NOT_STARTED: Initiated by ADMIN or assigned REFEREE
- NOT_STARTED → IN_PROGRESS: Started by ADMIN or assigned REFEREE
- IN_PROGRESS → FINISHED: Completed by ADMIN or assigned REFEREE
- FINISHED → NOT_STARTED: ADMIN only (to retry/reset single match)

Restrictions:

- Referees cannot make all transitions; must follow required flow (no skip to FINISHED)
- Admin can force any transition
- FINISHED status requires valid score and goal records

### 2.2 Stage Simulation (Admin Only)

When admin calls `POST /api/competition/rounds/:roundId/simulate`:

1. System validates previous round is fully FINISHED (or is first round)
2. System generates non-draw results for all matches in the round (winner always determined)
3. System creates Goal records for each generated goal
4. System marks all matches as FINISHED
5. System auto-populates next round teams from winners (winner becomes home or away in next stage)
6. Simulation can be called multiple times to regenerate results (for testing/demo)

### 2.3 Match Update Rules (ADMIN/REFEREE)

- Only ADMIN or assigned REFEREE can call update endpoints
- For non-first rounds, edits are blocked until all previous-round matches are FINISHED
- FINISHED status requires valid score (no draw) and Goal records
- Score cannot be equal (non-draw requirement for knockout)
- When setting FINISHED, at least one goal must exist (or app allows 1-0, 2-1 type scores)

### 2.4 Goal Scoring Rules

- Goal player (`playerId`) must exist in system
- Goal team must match player's team
- Goal team must be one of the match's home/away teams
- Multiple goals by same player are allowed
- Goals are persisted with optional `scoredMinute` metadata

### 2.5 Referee Assignment & Access

- Referees are assigned to first-stage matches only
- Referees see their assigned matches in a queue on the referee page
- Referees can only update (status, result, goals) on their assigned matches
- Admin can update any match regardless of assignment
- Referee role has restricted status transitions (no direct PLANNED → FINISHED)

### 2.6 Round/Stage Progression

- System internally uses numeric roundOrderNumber (1, 2, 3, 4) and text roundName (eighthFinal, quarterFinal, semiFinal, final)
- API routes accept both `/api/competition/rounds/1/simulate` and `/api/competition/rounds/quarterFinal/simulate`
- Round advancement is automatic when all matches in round are FINISHED
- Next round matches are pre-created with winner team assignments

## 3. Security & Authentication

- JWT token required for protected routes
- Token issued on login/register, stored in browser
- Route-level role checks (requireRoles middleware) block unauthorized actions
- Service-level checks enforce context (ownership, assignment, stage progression)

## 4. Error Handling

The backend uses typed errors for consistent API responses:

- `ValidationError` (400) - Invalid input, business rule violation
- `NotFoundError` (404) - Resource not found
- `ForbiddenError` (403) - Permission denied (not authorized for action)
- `UnauthorizedError` (401) - No valid JWT or token expired

All errors include `message` and optionally `details` for debugging.

## 5. Data Types & Status Values

Match statuses (standardized):

- `PLANNED` - Initial seeded state, ready for start
- `NOT_STARTED` - Match initiated, countdown phase
- `IN_PROGRESS` - Match currently being played
- `FINISHED` - Match completed with final score

User roles:

- `ADMIN` - Full system access (simulate, reset, user management)
- `REFEREE` - Match update access (assigned matches only)
- `USER` - Authenticated read-only
- `GUEST` - Unauthenticated, limited home/fixture access

## 6. Swagger as API Contract

Swagger UI at `http://localhost:3000/api-docs` provides:

- Live-executable API endpoints
- Complete request/response schemas
- Authentication flow demo
- Try-it-out button for testing

Frontend and QA should use Swagger as the source of truth for endpoint contracts.
