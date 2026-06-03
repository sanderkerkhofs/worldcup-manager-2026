# US-02 Automatic Stage Activation

## User Story

As an **admin**,  
I'm able to have stages activate in fixed order automatically,  
So that I can keep match planning simple and consistent without manual intervention.

## Roles Involved

- **ADMIN** — triggers stage simulation / progression

## Acceptance Criteria

- First stage (`8th Final`) starts as the active stage automatically
- Next stage cannot become active before the previous one is fully completed
- Stage status changes from `PLANNED` → `NOT_STARTED` → `IN_PROGRESS` → `FINISHED` at the match level
- Locked stages display a clear message when they cannot be activated yet
- Admin receives an error if trying to progress to next stage before all required matches are `FINISHED`

## Wireframe

```text
+------------------------------------------------------+
| Stage Control                                        |
+------------------------------------------------------+
| 8th Final     [ Active ]     Status: IN_PROGRESS     |
| Quarterfinal  [ Locked ]     Status: PLANNED         |
| Semifinal     [ Locked ]     Status: PLANNED         |
| Final         [ Locked ]     Status: PLANNED         |
|                                                      |
| Message: Next stage opens when previous stage ends.  |
+------------------------------------------------------+
```

## Domain Model Reference (schema.prisma)

- **MatchStatus enum**: `PLANNED | NOT_STARTED | IN_PROGRESS | FINISHED`
- Stage ordering is driven by `Match.roundOrderNumber` (integer)
- No separate `Round` or `Stage` entity — all stage metadata lives on the `Match` model

## Business Rules

- Progression is blocked while any match in the current stage is not `FINISHED`
- Winners from the current stage are copied to home/away slots of the next stage matches
- Winner pairing: match1 winner vs match2 winner, match3 winner vs match4 winner, etc.
