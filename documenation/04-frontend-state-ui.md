# 04 - Frontend, State, and UI Responsibilities

## 1. Session and Auth State

`useSession` manages:

- token
- user object
- isAuthenticated state
- setSession/login and logout actions

Session is persisted in browser storage and rehydrated on load.

## 2. Role-Based Data Fetching

The frontend uses role-aware state management:

- `isAuthenticated` - boolean flag for token presence
- `user?.role` - one of: ADMIN, REFEREE, USER, or undefined (GUEST)
- Protected pages check `isAuthenticated` and `user?.role` before rendering
- Statistics panels conditionally render based on `isAuthenticated` flag
- Guest users (unauthenticated) can view current round fixtures without login

The app uses SWR for:

- caching
- revalidation
- predictable async state (`isLoading`, `error`, `mutate`)

Pages call typed service functions from `front-end/services`.

## 3. Role-Based Pages

- `/`: main dashboard with current round and matches (always visible)
  - Standings and top scorers visible only to authenticated users (ADMIN, REFEREE, USER)
  - Guest sees current round fixtures only
- `/admin`: tournament simulation, reset, user management, standings/top scorers view (ADMIN only)
- `/referee`: assigned match queue and result entry (REFEREE only)
- `/matches/[matchId]`: detailed match editing with goal scorer registration (ADMIN, REFEREE, or public read-only)
- `/rounds/[roundId]`: stage bracket and match list
- `/stats`: top scorers and tournament statistics (authenticated users only: ADMIN, REFEREE, USER)
- `/login`: authentication page (unauthenticated)
- `/register`: account creation page - creates USER role (unauthenticated)

## 4. UI Design Pattern

The frontend uses reusable card/table styles:

- `heroCard` for summary/entry sections
- `panelCard` for operational panels
- `tableWrap` for scroll-safe tables

This keeps UI consistent while pages change content.

## 5. Match Status Display

Status values shown in UI match implementation:

- `PLANNED` - match not yet initiated
- `NOT_STARTED` - match initiated by referee/admin
- `IN_PROGRESS` - match in play
- `FINISHED` - match completed

Frontend service and backend are aligned on these values.

## 6. How Frontend Maps to Backend Services

Key service methods:

- `getOverview()` -> `/api/competition` (teams, rounds, matches, standings, top scorers)
- `simulateRound(roundId)` -> `/api/competition/rounds/:roundId/simulate`
- `resetMatches()` -> `/api/competition/reset-matches`
- `updateMatchStatus(matchId, status)` -> `PATCH /api/matches/:matchId/status`
- `updateMatchResult(matchId, result)` -> `PUT /api/matches/:matchId/result`
- `addGoal(matchId, goalData)` -> `POST /api/matches/:matchId/goals`
- `updateGoal(matchId, goalId, goalData)` -> `PATCH /api/matches/:matchId/goals/:goalId`

The frontend calls endpoints with stage identifiers (roundId = 1-4), and backend resolves these to match fixtures.

## 7. Practical Learning Tip

When debugging a page:

1. Inspect page-level SWR keys
2. Inspect called service methods
3. Inspect corresponding backend controller + service
4. Confirm domain validation rules
