# 02 - User Stories

## US-01 Seed fixed knockout structure

As an admin, I want the tournament structure pre-created so I do not manually build rounds and matches.

Acceptance criteria:

- 8th Final, Quarterfinal, Semifinal, Final exist after seeding.
- First round has teams assigned.
- Later rounds exist with pending team slots.

## US-02 View competition overview

As a guest, I want a public overview so I can follow the tournament state.

Acceptance criteria:

- Can view rounds, fixtures, match scores/status.
- Can view standings and top scorers.
- Cannot perform write actions.

## US-03 Authenticate and access role pages

As a registered user, I want to log in and get role-aware navigation.

Acceptance criteria:

- Login returns token + user payload.
- Session persists in browser storage.
- Nav and page access change based on role.

## US-04 Admin simulates a round

As an admin, I want to simulate active round matches to accelerate demos.

Acceptance criteria:

- Simulation generates non-draw results.
- Simulation creates goal events linked to players.
- Winners progress automatically to next round when ready.

## US-05 Admin resets tournament matches

As an admin, I want to reset scores/goals to restart the tournament.

Acceptance criteria:

- All goals are removed.
- First round returns to active state with teams retained.
- Future rounds clear teams and reset statuses.

## US-06 Referee updates assigned match status

As a referee, I want to update only my assigned matches so responsibilities stay clear.

Acceptance criteria:

- Referee can set `IN_PROGRESS` and `FINISHED` only.
- Referee cannot edit unassigned matches.
- Invalid state transitions are rejected.

## US-07 Referee records goals and result

As a referee, I want to register goal scorers and scores so results are accurate.

Acceptance criteria:

- Only `AVAILABLE` players can score.
- Team/player mismatch is rejected.
- Match score recalculates from goals when goals are used.

## US-08 Coach manages own squad availability

As a coach, I want to mark my players available/unavailable to prepare matches.

Acceptance criteria:

- Coach can only modify players from own team.
- Availability changes persist.
- Other team edits are forbidden.

## US-09 Admin manages users

As an admin, I want to list and delete users for moderation.

Acceptance criteria:

- Admin can list all users.
- Admin can delete users.
- Admin cannot delete own account.

## US-10 Match edit lock by round order

As the system, I want to block edits of later-round matches until previous round is completed.

Acceptance criteria:

- Any status/result/goal edit for round N fails if round N-1 is not fully `COMPLETED`.
- Unlock occurs automatically once previous round completion is validated.
