# User Stories - worldcup-manager-2026

## US-01 Seed Fixed Rounds

As an admin, I want fixed rounds to be seeded in the database so that no manual round structure is needed.

### Acceptance Criteria

- System seeds fixed rounds in the database for the competition
- Default order is fixed (16th Final -> Round of 16 -> Quarterfinals -> Semifinals -> Final)
- Admin can see all rounds immediately

### Wireframe

```text
+------------------------------------------------------+
| Competition Setup - Rounds                           |
+------------------------------------------------------+
| Pre-created rounds                                   |
| 1. 16th Final           Status: Not started          |
| 2. Round of 16          Status: Not started          |
| 3. Quarterfinals        Status: Not started          |
| 4. Semifinals           Status: Not started          |
| 5. Final                Status: Not started          |
+------------------------------------------------------+
```

## US-02 Initiate Round

As an admin, I want to initiate rounds in fixed order so that match planning can start per stage.

### Acceptance Criteria

- Admin can start the next allowed round
- A round cannot be initiated before the previous one is completed
- Round status changes from not started to active

### Wireframe

```text
+------------------------------------------------------+
| Round Control                                        |
+------------------------------------------------------+
| 16th Final       [ Initiate ]      Status: Not started |
| Round of 16      [ Locked ]        Status: Not started |
| Quarterfinals    [ Locked ]        Status: Not started |
| Semifinals       [ Locked ]        Status: Not started |
| Final            [ Locked ]        Status: Not started |
|                                                      |
| Message: Complete current round before next round.   |
+------------------------------------------------------+
```

## US-03 Update Matches in Active Round

As a referee, I want to update match status in an active round so that fixtures stay correct and clear.

### Acceptance Criteria

- Referee can update match status (not started, active, completed)
- Status changes are stored and immediately visible in fixtures
- Assigned referee can only update status for their assigned match
- Admin can update status for all matches

### Wireframe

```text
+------------------------------------------------------+
| 16th Final - Match Editor                             |
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

## US-05 Coach Selects Players for Match

As a coach, I want to mark my players as available or unavailable so that the referee can only use available players when registering goal scorers.

### Acceptance Criteria

- Coach can only manage players from their own team
- Each team has at least 15 seeded players
- Player status uses fixed values only: available, unavailable
- Coach can update player status at any time
- Status changes are stored on the player record
- System blocks edits for teams not owned by the logged-in coach
- Referee can only select players with status available when registering goal scorers

### Wireframe

```text
+------------------------------------------------------+
| Squad Status                                         |
+------------------------------------------------------+
| Team: Netherlands                                    |
|                                                      |
| Player                 Status                        |
| Player A               available                     |
| Player B               unavailable                   |
| Player C               available                     |
| ...                                                  |
|                                                      |
| [ Save Status ]                                      |
| Error: You can only edit your own team.              |
+------------------------------------------------------+
```

## US-06 Progress Winners to Next Round

As an admin, I want winners to move to the next pre-created round so that knockout progression is managed automatically.

### Acceptance Criteria

- System selects winners from completed matches
- Winners are assigned to next round matches
- Progression is blocked when not all required matches are completed

### Wireframe

```text
+------------------------------------------------------+
| Progress Winners                                     |
+------------------------------------------------------+
| Source round: 16th Final                             |
| Completed matches: 8 / 8                             |
| [ Move Winners to Quarterfinals ]                    |
|                                                      |
| Assigned teams in Quarterfinals                      |
| Match 1: Netherlands vs Brazil                       |
| Match 2: Argentina vs France                         |
|                                                      |
| Error: Cannot progress if matches are missing.       |
+------------------------------------------------------+
```

## US-07 View Tournament Bracket Overview

As a viewer, I want to see a simple bracket overview so that I can follow current round, results, and final winner.

### Acceptance Criteria

- Overview shows rounds, matches, and match status
- Overview highlights current active round
- Final winner is clearly shown when final is completed

### Wireframe

```text
+------------------------------------------------------+
| Tournament Bracket - World Cup 2026                  |
+------------------------------------------------------+
| 16th Final  Round of 16  Quarterfinals  Semifinals   |
|                              Final                    |
| NED 2-1 GER  -> NED vs BRA      -> NED vs ESP -> NED |
| ARG 3-0 USA  -> ARG vs FRA      -> ARG vs POR ->     |
| ...                                                  |
| Current round: Quarterfinals                         |
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
| [ Login as Admin, Coach, or Referee ]               |
|                                                      |
| Access denied: management actions require login.     |
+------------------------------------------------------+
```

## Sprint Priority Notes (School Requirement Alignment)

- Read and Delete stories must be fully implemented in both frontend and backend in the current sprint.
- For each HTTP operation (`GET`, `POST`, `PUT`, `DELETE`), at least one full route must be testable via Swagger against the real database.
- Frontend story implementation must use reusable components and API service modules (no direct fetch logic in UI components).
- Keep knockout scope simple: pre-created rounds, sequential initiation, and winner progression only after required matches are completed.
