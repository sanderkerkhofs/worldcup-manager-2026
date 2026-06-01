# User Stories - worldcup-manager-2026

## US-01 Seed Fixed Stage Matches

As an admin, I want fixed stage matches to be seeded in the database so that no manual stage structure is needed.

### Acceptance Criteria

- System seeds fixed stage matches in the database for the competition
- Default order is fixed (8th Final -> Quarterfinal -> Semifinal -> Final)
- Admin can see all stages immediately

### Wireframe

```text
+------------------------------------------------------+
| Competition Setup - Stages                           |
+------------------------------------------------------+
| Pre-created stage matches                            |
| 1. 8th Final            Status: Not started          |
| 2. Quarterfinal         Status: Not started          |
| 3. Semifinal            Status: Not started          |
| 4. Final                Status: Not started          |
+------------------------------------------------------+
```

## US-02 Automatic Stage Activation

As an admin, I want stages to activate in fixed order automatically so that match planning stays simple and consistent.

### Acceptance Criteria

- First stage starts active automatically
- Next stage cannot become active before the previous one is completed
- Stage status changes from not started to active automatically when unlocked

### Wireframe

```text
+------------------------------------------------------+
| Stage Control                                        |
+------------------------------------------------------+
| 8th Final        [ Active ]        Status: Active      |
| Quarterfinal     [ Locked ]        Status: Not started |
| Semifinal        [ Locked ]        Status: Not started |
| Final            [ Locked ]        Status: Not started |
|                                                      |
| Message: Next stage opens when previous stage ends.  |
+------------------------------------------------------+
```

## US-03 Update Matches in Active Stage

As a referee, I want to update match status in an active stage so that fixtures stay correct and clear.

### Acceptance Criteria

- Referee can update match status (not started, active, completed)
- Status changes are stored and immediately visible in fixtures
- Assigned referee can only update status for their assigned match
- Admin can update status for all matches

### Wireframe

```text
+------------------------------------------------------+
| 8th Final - Match Editor                              |
+------------------------------------------------------+
| Match 1                                              |
| Home: [ Netherlands v ]                              |
| Away: [ Germany v ]                                  |
| Date: [ 2026-06-22 18:00 ]                           |
| Role: Referee                                         |
| Status: [ Active v ]                                 |
| [ Save Match ]                                       |
|                                                      |
| Error: Home and away teams must be different.        |
+------------------------------------------------------+
```

## US-04 Enter Match Results

As a referee, I want to enter and update match goals and goal scorers so that winners can be determined and top-scorer ranking can be generated later.

### Acceptance Criteria

- Referee can enter and update goals for both teams
- Referee can register which player(s) scored goals using dedicated player records (player ID)
- Assigned referee can only enter/update result for their assigned match
- Admin can enter/update results for all matches
- Match status is set to completed after valid result submission
- Result is visible in fixture list

### Wireframe

```text
+------------------------------------------------------+
| Enter Result                                         |
+------------------------------------------------------+
| Netherlands vs Germany                               |
| Role: Referee                                         |
| Home score: [__]                                     |
| Away score: [__]                                     |
| Goal scorers:                                        |
| - Netherlands: [Player A x2, Player B x1]           |
| - Germany:     [Player C x1]                        |
| [ Submit Result ]                                    |
|                                                      |
| Fixture list                                         |
| Netherlands 2 - 1 Germany      Status: Completed     |
+------------------------------------------------------+
```

## US-06 Progress Winners to Next Stage

As an admin, I want winners to move to the next pre-created stage matches so that knockout progression is managed automatically.

### Acceptance Criteria

- System selects winners from completed matches
- Winners are assigned to next stage matches
- Progression is blocked when not all required matches are completed

### Wireframe

```text
+------------------------------------------------------+
| Progress Winners                                     |
+------------------------------------------------------+
| Source stage: 8th Final                              |
| Completed matches: 8 / 8                             |
| [ Move Winners to Quarterfinal ]                     |
|                                                      |
| Assigned teams in Quarterfinal                        |
| Match 1: Netherlands vs Brazil                       |
| Match 2: Argentina vs France                         |
|                                                      |
| Error: Cannot progress if matches are missing.       |
+------------------------------------------------------+
```

## US-07 View Tournament Bracket Overview

As a viewer, I want to see a simple bracket overview so that I can follow current stage, results, and final winner.

### Acceptance Criteria

- Overview shows stages, matches, and match status
- Overview highlights current active stage
- Final winner is clearly shown when final is completed

### Wireframe

```text
+------------------------------------------------------+
| Tournament Bracket - World Cup 2026                  |
+------------------------------------------------------+
| 8th Final  Quarterfinal  Semifinal  Final            |
|                              Final                    |
| NED 2-1 GER  -> NED vs BRA      -> NED vs ESP -> NED |
| ARG 3-0 USA  -> ARG vs FRA      -> ARG vs POR ->     |
| ...                                                  |
| Current stage: Quarterfinal                          |
| Winner: Netherlands (shown after final completion)   |
+------------------------------------------------------+
```

## US-08 Guest Views Public Info Only

As a guest, I want to view public competition information only so that private management features stay protected.

### Acceptance Criteria

- Guest can view public fixtures, bracket, standings/results pages
- Guest cannot access create/update/delete actions
- Guest receives clear access denied feedback on protected pages

### Wireframe

```text
+------------------------------------------------------+
| Tournament Overview (Guest)                          |
+------------------------------------------------------+
| Public data                                          |
| - Upcoming fixtures                                  |
| - Completed matches                                  |
| - Bracket progress                                   |
|                                                      |
| [ Login as Admin or Referee ]                       |
|                                                      |
| Access denied: management actions require login.     |
+------------------------------------------------------+
```

## Sprint Priority Notes (School Requirement Alignment)

- Read and Delete stories must be fully implemented in both frontend and backend in the current sprint.
- For each HTTP operation (`GET`, `POST`, `PUT`, `DELETE`), at least one full route must be testable via Swagger against the real database.
- Frontend story implementation must use reusable components and API service modules (no direct fetch logic in UI components).
- Keep knockout scope simple: pre-created stage matches, sequential initiation, and winner progression only after required matches are completed.
