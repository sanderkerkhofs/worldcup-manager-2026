# 04 - Frontend, State, and UI Responsibilities

## 1. Session and Auth State

`useSession` manages:

- token
- user object
- isAuthenticated state
- setSession/login and logout actions

Session is persisted in browser storage and rehydrated on load.

## 2. Data Fetching Strategy

The app uses SWR for:

- caching
- revalidation
- predictable async state (`isLoading`, `error`, `mutate`)

Pages call typed service functions from `front-end/services`.

## 3. Role-Based Pages

- `/admin`: user management and round access
- `/coach`: player availability for coach team
- `/referee`: assigned match queue and actions
- `/matches/[matchId]`: detailed match editing
- `/rounds/[roundId]`: stage controls and match list

Routing note:

- `/rounds` redirects to `/` because bracket overview is now centralized on the dashboard.

## 4. UI Design Pattern

The frontend uses reusable card/table styles:

- `heroCard` for summary/entry sections
- `panelCard` for operational panels
- `tableWrap` for scroll-safe tables

This keeps UI consistent while pages change content.

## 5. Match Status Display

Status values are now expressed as:

- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`

UI and backend were aligned to this vocabulary.

## 6. How Frontend Maps to Backend Services

Examples:

- `getOverview()` -> `/api/competition`
- `updateMatchStatus()` -> `/api/matches/:matchId/status`
- `updatePlayerStatus()` -> `/api/players/:playerId/status`
- `simulateRound()` -> `/api/competition/rounds/:roundId/simulate`

The frontend still calls round endpoints, but `roundId` is a stage identifier rather than a persisted round entity id.

This mapping is centralized in service files for maintainability.

## 7. Practical Learning Tip

When debugging a page:

1. Inspect page-level SWR keys
2. Inspect called service methods
3. Inspect corresponding backend controller + service
4. Confirm domain validation rules
