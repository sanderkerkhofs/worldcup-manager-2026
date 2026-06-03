# US-06 Progress Winners to Next Stage

## User Story

As an **admin**,  
I'm able to have winners automatically move to the next pre-created stage,  
So that I can keep knockout progression managed without manual team assignment.

## Roles Involved

- **ADMIN** — triggers stage simulation / winner progression

## Acceptance Criteria

- System selects winners from all completed (`FINISHED`) matches in the current stage
- Winners are assigned to home/away slots of the next stage matches in bracket order
- Progression is blocked when not all required matches in the current stage are `FINISHED`
- Winner pairing follows bracket order: match1 winner vs match2 winner, match3 winner vs match4 winner, etc.
- Admin receives an error if attempting progression before all matches are complete
- Next-stage matches become editable only after progression is complete

## Wireframe

```text
+------------------------------------------------------+
| Progress Winners                                     |
+------------------------------------------------------+
| Source stage: 8th Final                              |
| Completed matches: 8 / 8                             |
| [ Move Winners to Quarterfinal ]                     |
|                                                      |
| Assigned teams in Quarterfinal                       |
| Match 1: Netherlands vs Brazil                       |
| Match 2: Argentina vs France                         |
| Match 3: Spain vs England                            |
| Match 4: Germany vs Portugal                         |
|                                                      |
| Error: Cannot progress — not all matches finished.   |
+------------------------------------------------------+
```

## Domain Model Reference (schema.prisma)

| Field              | Type        | Notes                                                |
| ------------------ | ----------- | ---------------------------------------------------- |
| `roundOrderNumber` | Int         | Used to determine stage sequence                     |
| `homeTeamId`       | String?     | Updated with winning team ID                         |
| `awayTeamId`       | String?     | Updated with winning team ID                         |
| `status`           | MatchStatus | Must be `FINISHED` for all matches in previous stage |

## Business Rules

- All matches in the previous stage must have status `FINISHED` before progression
- A match cannot produce a winner if the result is a draw (draws are rejected at result entry)
- Winner is the team with the higher score (`homeScore` vs `awayScore`)
- Bracket pairing: winners of consecutive match pairs fill home/away slots of next-stage matches
