# Business Logic (Simplified)

## Competition Scope

- The application runs one fixed competition: `worldcup-manager-2026`.
- No tournament CRUD is required.
- Seeded structure:
  - 16 teams
  - 4 rounds
  - Round names: `8th Final`, `Quarterfinal`, `Semifinal`, `Final`

## Roles and Permissions

- `ADMIN`
  - Initiate a round
  - Simulate a round
  - Manage users (list and delete users, except self-delete)
- `REFEREE`
  - Update status and result for assigned matches
  - Add or update goals for assigned matches
- `COACH`
  - Update player availability for own team
- `GUEST`
  - Read-only competition view

## Round Progression Rules

- First round (`8th Final`) is seeded with 8 matches.
- Next rounds are not manually created by admins.
- A next-round match set is auto-created when all matches in the current round are:
  - `COMPLETED`
  - have valid scores
  - are non-draw results
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
  - be `AVAILABLE`
- Match scores are recalculated from goals when goals are supplied.

## Round Actions

- `Initiate round`
  - Sets current round matches to `ACTIVE`.
  - For non-first rounds, this is only allowed when previous round is fully completed.
  - If a non-first round has no matches yet, initiate will create the round matches from previous-round winners.
- `Simulate round`
  - Creates realistic non-draw goal events
  - Sets each match to `COMPLETED`
  - Auto-triggers next-round creation when ready

## Simplifications Applied

- Manual match creation by admin is removed from API and admin UI.
- Admin page is now focused on:
  - User management (delete user)
  - Navigation to round pages

## User Management Rules

- Admin can list all users.
- Admin can delete users.
- Admin cannot delete own account.

## Why Semifinal Could Be Empty Before

- In the previous flow, next-round teams appeared only after explicit progression actions.
- If previous round completion/progression was not triggered properly, `Semifinal` could remain empty.
- Current logic auto-creates the next round once the previous round is fully completed, reducing manual steps and confusion.
