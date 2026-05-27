# 05 - Backend Architecture and API

## 1. Layered architecture

## Request flow

Client -> Controller -> Service -> Repository (Prisma) -> PostgreSQL

## Layer responsibilities

- Controller:
  - route wiring
  - auth middleware usage
  - request/response mapping
- Service:
  - business workflow
  - authorization checks
  - progression logic
- Domain model:
  - constructor invariants
  - static `from` mappings
- Repository/Prisma:
  - persistence
  - indexes and constraints

## 2. Target backend structure

```text
back-end/
  app.ts
  controller/
    authController.ts
    tournamentController.ts
    matchController.ts
    playerController.ts
    userController.ts
  service/
    authService.ts
    tournamentService.ts
    roundProgressionService.ts
    matchService.ts
    playerService.ts
    userService.ts
  model/
    user.ts
    team.ts
    player.ts
    match.ts
    goal.ts
  repository/
    prisma/
      schema.prisma
      migrations/
      client.ts
  util/
    middleware.ts
    jwt.ts
    password.ts
    swagger.ts
    competition.ts
    seed.ts
  types/
    index.ts
  test/
```

## 3. Core endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Competition

- `GET /api/competition`
- `GET /api/competition/overview`
- `GET /api/competition/bracket`
- `GET /api/competition/rounds`
- `POST /api/competition/rounds/:roundId/simulate` (admin)
- `POST /api/competition/reset-matches` (admin)

### Matches

- `GET /api/matches`
- `GET /api/matches/top-scorers`
- `GET /api/matches/:matchId`
- `PATCH /api/matches/:matchId/status` (admin/referee)
- `PUT /api/matches/:matchId/result` (admin/referee)
- `POST /api/matches/:matchId/goals` (admin/referee)
- `PATCH /api/matches/:matchId/goals/:goalId` (admin/referee)

### Players

- `GET /api/players`
- `GET /api/players/:playerId`
- `POST /api/players` (admin)
- `PUT /api/players/:playerId` (admin)
- `PATCH /api/players/:playerId/status` (admin)
- `DELETE /api/players/:playerId` (admin)

### Users

- `GET /api/users` (admin)
- `DELETE /api/users/:userId` (admin, no self-delete)

## 4. Middleware design

- `authenticateToken`
- `requireRoles(...roles)`
- `asyncHandler`
- centralized `errorHandler`

## 5. API contract principles

- Never expose password hash.
- Return typed DTOs only.
- Keep enum values consistent between DB, backend, frontend.
- Use explicit validation errors with clear messages.

## 6. Swagger requirements

- mounted at `/api-docs`
- include schemas for all request/response bodies
- include auth requirements per protected route
- include examples for role-specific routes

## 7. Testing strategy

- domain unit tests:
  - invariant checks
  - enum validation
  - invalid constructor input rejection
- service unit tests:
  - role guard logic
  - round lock logic
  - progression logic
  - score/goal validation
- manual verification via Swagger for endpoint behavior
