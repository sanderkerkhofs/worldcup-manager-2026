# US-04 Enter Match Results

## User Story

As a **referee**,  
I'm able to enter and update match goals and goal scorers,  
So that I can determine winners and generate a top-scorer ranking.

## Roles Involved

- **REFEREE** — enters/updates goals for their assigned match
- **ADMIN** — can enter/update goals for all matches

## Acceptance Criteria

- Referee can enter and update goals for both home and away teams
- Referee registers which player scored each goal (by player ID from the dedicated `Player` table)
- Goal scorer must exist and belong to the scoring team
- Assigned referee can only enter/update results for their own assigned match
- Admin can enter/update results for all matches
- Home and away scores are recalculated from the goals submitted
- Scores must be non-negative integers
- Knockout matches cannot end in a draw
- Result is visible in the fixture list after submission

## Wireframe

```text
+------------------------------------------------------+
| Enter Result                                         |
+------------------------------------------------------+
| Netherlands vs Germany                               |
| Logged in as: Referee                                |
| Home score: [__]                                     |
| Away score: [__]                                     |
| Goal scorers:                                        |
| - Netherlands: [ Player A x2, Player B x1 ]         |
| - Germany:     [ Player C x1 ]                      |
| [ Submit Result ]                                    |
|                                                      |
| Fixture list                                         |
| Netherlands 2 - 1 Germany   Status: FINISHED         |
+------------------------------------------------------+
```

## Domain Model Reference (schema.prisma)

### Goal model

| Field       | Type          | Notes                    |
| ----------- | ------------- | ------------------------ |
| `id`        | String (CUID) | Primary key              |
| `matchId`   | String        | FK → Match               |
| `playerId`  | String        | FK → Player              |
| `teamId`    | String        | FK → Team (scoring team) |
| `createdAt` | DateTime      | Auto-generated           |

### Match score fields

| Field       | Type | Notes                        |
| ----------- | ---- | ---------------------------- |
| `homeScore` | Int? | Derived from goals submitted |
| `awayScore` | Int? | Derived from goals submitted |

## Business Rules

- `Goal.playerId` must resolve to a `Player` that belongs to `Goal.teamId`
- Match score is recalculated from goals when goals are supplied
- Draw result is rejected for knockout format
