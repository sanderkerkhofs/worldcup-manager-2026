# 06 — REST API Endpoints

> **Every route the back-end exposes — what it does, who can call it, and what it returns.**

---

## Auth routes — `/api/auth`

| Method | Path                 | Auth               | Description                                 |
| ------ | -------------------- | ------------------ | ------------------------------------------- |
| POST   | `/api/auth/register` | None               | Create a new user account, returns a JWT    |
| POST   | `/api/auth/login`    | None               | Login with username/password, returns a JWT |
| GET    | `/api/auth/me`       | Any logged-in user | Get the currently authenticated user's info |

---

## Competition routes — `/api/competition`

| Method | Path                               | Auth  | Description                                                 |
| ------ | ---------------------------------- | ----- | ----------------------------------------------------------- |
| GET    | `/api/competition`                 | USER+ | Get full overview: competition info, rounds, matches, teams |
| GET    | `/api/competition/rounds`          | USER+ | List all rounds with their matches                          |
| GET    | `/api/competition/rounds/simulate` | ADMIN | Simulate completing the current round (testing)             |
| DELETE | `/api/competition/matches/reset`   | ADMIN | Reset all matches back to initial state                     |
| GET    | `/api/competition/standings`       | USER+ | Current tournament standings table                          |
| GET    | `/api/competition/top-scorers`     | USER+ | Players ranked by goals scored                              |

---

## Match routes — `/api/matches`

| Method | Path                             | Auth             | Description                             |
| ------ | -------------------------------- | ---------------- | --------------------------------------- |
| GET    | `/api/matches/:id`               | USER+            | Get a single match with goals and teams |
| PATCH  | `/api/matches/:id/status`        | ADMIN or REFEREE | Change match status                     |
| PATCH  | `/api/matches/:id/result`        | ADMIN            | Manually set the score                  |
| POST   | `/api/matches/:id/goals`         | ADMIN or REFEREE | Record a goal in a match                |
| PATCH  | `/api/matches/:id/goals/:goalId` | ADMIN or REFEREE | Edit an existing goal record            |
| DELETE | `/api/matches/:id/goals/:goalId` | ADMIN            | Remove a goal record                    |

---

## Player routes — `/api/players`

| Method | Path                      | Auth  | Description                             |
| ------ | ------------------------- | ----- | --------------------------------------- |
| GET    | `/api/players`            | USER+ | List all players (can filter by teamId) |
| GET    | `/api/players/:id`        | USER+ | Get a single player                     |
| PATCH  | `/api/players/:id/status` | ADMIN | Set player AVAILABLE or UNAVAILABLE     |

---

## User routes — `/api/users`

| Method | Path                  | Auth  | Description          |
| ------ | --------------------- | ----- | -------------------- |
| GET    | `/api/users`          | ADMIN | List all users       |
| GET    | `/api/users/:id`      | ADMIN | Get a single user    |
| PATCH  | `/api/users/:id/role` | ADMIN | Change a user's role |

---

## Request & response examples

### POST `/api/auth/login`

```json
// Request body
{ "username": "referee1", "password": "referee123" }

// Response 200 OK
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..." }
```

### POST `/api/matches/:id/goals`

```json
// Request body
{ "playerId": "clx123...", "teamId": "cly456..." }

// Response 201 Created
{
  "id": "clz789...",
  "matchId": "abc...",
  "playerId": "clx123...",
  "teamId": "cly456...",
  "createdAt": "2026-06-15T18:32:00.000Z"
}
```

### PATCH `/api/matches/:id/status`

```json
// Request body
{ "status": "IN_PROGRESS" }

// Response 200 OK
{ "id": "...", "status": "IN_PROGRESS", ... }
```

---

## HTTP status codes used

| Code | Meaning               | When returned                          |
| ---- | --------------------- | -------------------------------------- |
| 200  | OK                    | Successful read or update              |
| 201  | Created               | Successful POST (new resource created) |
| 400  | Bad Request           | Invalid input (ValidationError)        |
| 401  | Unauthorized          | No token or invalid token              |
| 403  | Forbidden             | Valid token but wrong role             |
| 404  | Not Found             | Resource doesn't exist                 |
| 500  | Internal Server Error | Unexpected server error                |
