# Business Logic (Simplified)

## Competition Scope

- The application runs one fixed competition: `worldcup-manager-2026`.
- No tournament CRUD is required.
- Seeded structure:
  - 16 teams
  - 4 stages
  - Stage names: `8th Final`, `Quarterfinal`, `Semifinal`, `Final`
- No dedicated `Round` entity is stored in the database.
- Stage metadata lives on each match (`roundOrderNumber`, `roundName`).

## Roles and Permissions

- `ADMIN`
  - Simulate stages (auto-initializes and progresses stages)
  - Reset matches to initial state
  - Manage users (list and delete users, except self-delete)
- `REFEREE`
  - Update status and result for assigned matches
  - Add or update goals for assigned matches
  - View current round, matches, and statistics
- `USER` (authenticated)
  - View current round and matches
  - View statistics (standings, top scorers)
  - Read-only tournament access
- `GUEST` (unauthenticated)
  - View current round fixtures only
  - Access to login/register pages
  - No access to statistics or detailed match information

## Stage Progression Rules

- First stage (`8th Final`) is seeded with 8 matches and known teams.
- Later stages are precreated but start with unknown teams.
- Winners are copied to the next stage only when all matches in the previous stage are:
  - `COMPLETED`
  - valid scored matches
  - non-draw outcomes
- Winners are paired in bracket order:
  - match1 winner vs match2 winner
  - match3 winner vs match4 winner
  - and so on

## Match Status Lifecycle

Match statuses progress in one direction:

- `PLANNED` - initial state (precreated matches)
- `NOT_STARTED` - after admin initiates/simulates or referee starts
- `IN_PROGRESS` - while match is being played
- `FINISHED` - when match is completed with final result

## Match Rules

- Knockout matches cannot end in a draw.
- Score input must be non-negative integers.
- Goal scorer must:
  - exist
  - belong to the selected scoring team
- Match scores are recalculated from goals when goals are supplied.

## Stage Actions

- `Simulate stage`
  - Progresses stage through lifecycle automatically
  - For first stage: ensures matches exist and have teams assigned
  - For subsequent stages: validates previous stage is complete
  - Creates realistic non-draw goal events for each match
  - Sets each match to `FINISHED` with complete results
  - Auto-fills next-stage teams when current stage completes
  - Can be run multiple times to regenerate results (for testing)

- `Reset matches`
  - Clears all match results and goalsFINISHED`.
- This lock is enforced for status updates, result updates, goal insertions, and goal edits.
- The lock prevents accidental edits to early-stage results after progression
  - Allows re-running simulations from the beginning

## Edit Lock Rule

- A non-first-stage match cannot be edited until all matches in the previous stage are `COMPLETED`.
- This lock is enforced for status updates, result updates, goal insertions, and goal edits.

## User Management Rules

- Admin can list all users.
- Admin can delete users.
- Admin cannot delete own account.
