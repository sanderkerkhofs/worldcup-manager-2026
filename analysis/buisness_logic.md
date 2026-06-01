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
  - Initiate a stage
  - Simulate a stage
  - Manage users (list and delete users, except self-delete)
- `REFEREE`
  - Update status and result for assigned matches
  - Add or update goals for assigned matches
- `GUEST`
  - Read-only competition view

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

## Match Rules

- Knockout matches cannot end in a draw.
- Score input must be non-negative integers.
- Goal scorer must:
  - exist
  - belong to the selected scoring team
- Match scores are recalculated from goals when goals are supplied.

## Stage Actions

- `Initiate stage`
  - Sets selected stage matches from `NOT_STARTED` to `IN_PROGRESS`.
  - For non-first stages, this is allowed only when the previous stage is fully completed.
- `Simulate stage`
  - Creates non-draw goal events
  - Sets each match to `COMPLETED`
  - Auto-fills next-stage teams when ready

## Edit Lock Rule

- A non-first-stage match cannot be edited until all matches in the previous stage are `COMPLETED`.
- This lock is enforced for status updates, result updates, goal insertions, and goal edits.

## User Management Rules

- Admin can list all users.
- Admin can delete users.
- Admin cannot delete own account.
