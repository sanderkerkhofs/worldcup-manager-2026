# 03 - Domain and Business Logic

## 1. Core invariants

- A match must have either both teams assigned or both null.
- Home and away team must differ.
- Scores are non-negative integers when present.
- Knockout matches cannot end in draw.
- Player shirt number unique per team.
- Goal scorer must be an available player in scoring team.

## 2. Round progression algorithm

Input: completed round id/order number.

Algorithm:

1. Load all matches from completed round.
2. Verify each match is `FINISHED` or `COMPLETED` and has non-null scores.
3. Compute winner per match (`homeScore > awayScore` or vice versa).
4. Validate winner count is even.
5. Load next round matches.
6. Pair winners in bracket order:
   - winner(1) vs winner(2)
   - winner(3) vs winner(4)
   - etc.
7. Update next round matches with teams and reset score.
8. Set next round match status to `NOT_STARTED`.
9. Mark completed round matches from `FINISHED` to `COMPLETED`.

## 3. Edit lock rule

For any match in round N > 1:

- status update forbidden if round N-1 not fully `COMPLETED`
- result update forbidden if round N-1 not fully `COMPLETED`
- goal add/edit forbidden if round N-1 not fully `COMPLETED`

## 4. Match status transitions

### Referee transitions

- `PLANNED` or `NOT_STARTED` -> `IN_PROGRESS`
- `IN_PROGRESS` -> `FINISHED`

Referee cannot set arbitrary statuses.

### Admin transitions

- Admin can set full lifecycle statuses, but still must obey business constraints.

## 5. Result update rules

- Match must have assigned teams.
- Match must be `IN_PROGRESS` before result submission.
- Update path A: list of goals
  - overwrite old goals
  - validate each goal
  - recalculate match score from goals
- Update path B: direct `homeScore` + `awayScore`
  - both values required
  - no negative values
  - no draw values
- Default result status after valid update: `FINISHED`.

## 6. Simulation rules

- Round simulation is admin-only.
- Previous round must be finished/completed (except first round).
- Round must have fully known teams.
- Every simulated match must produce non-draw outcome.
- Goals must reference valid players from participating teams.

## 7. Standings and top scorers

### Standings

Computed from matches with status `FINISHED` or `COMPLETED` and known scores.

- win = 3 points
- draw = 1 point (kept for compatibility even if knockout should avoid draws)
- loss = 0 points
- sort by points desc, then goal difference desc

### Top scorers

Aggregate goal count by player id.
Return player name, team id/name/flag, goals.

## 8. Known clean-up targets for rebuild

To keep the new clean build consistent:

- keep one canonical role enum in backend, frontend, and DB (include `COACH`)
- align match status vocabulary across all docs and UI labels
- ensure coach permissions are implemented end-to-end (not only documented)
