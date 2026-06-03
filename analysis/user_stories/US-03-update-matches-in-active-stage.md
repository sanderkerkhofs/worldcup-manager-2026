# US-03 Update Matches in Active Stage

## User Story

As a **referee**,  
I'm able to update match status in an active stage,  
So that I can keep fixtures correct and up-to-date.

## Roles Involved

- **REFEREE** — updates status for their assigned match
- **ADMIN** — can update status for all matches

## Acceptance Criteria

- Referee can update match status: `NOT_STARTED` → `IN_PROGRESS` → `FINISHED`
- Status changes are stored and immediately visible in the fixture list
- An assigned referee can only update status for their own assigned match (`Match.refereeId`)
- Admin can update status for all matches regardless of assignment
- Match cannot be edited (status or result) if it belongs to a locked stage (previous stage not yet complete)
- Invalid status transitions are rejected

## Wireframe

```text
+------------------------------------------------------+
| 8th Final - Match Editor                             |
+------------------------------------------------------+
| Match 1                                              |
| Home: Netherlands                                    |
| Away: Germany                                        |
| Date: 2026-06-22 18:00                               |
| Logged in as: Referee                                |
| Status: [ NOT_STARTED  v ]                           |
| [ Save Match ]                                       |
|                                                      |
| Error: Home and away teams must be different.        |
+------------------------------------------------------+
```

## Domain Model Reference (schema.prisma)

| Field        | Type        | Notes                                            |
| ------------ | ----------- | ------------------------------------------------ |
| `refereeId`  | String?     | FK → User (referee assignment)                   |
| `status`     | MatchStatus | `PLANNED / NOT_STARTED / IN_PROGRESS / FINISHED` |
| `homeTeamId` | String?     | FK → Team                                        |
| `awayTeamId` | String?     | FK → Team                                        |

## Business Rules

- Status progression is one-directional
- Assigned referee is set via `Match.refereeId` → `User.id`
- `UserRole.REFEREE` can only modify their own assigned match
- `UserRole.ADMIN` can modify any match
