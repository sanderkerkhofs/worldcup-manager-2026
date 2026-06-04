# US-07 View Tournament Bracket Overview

## User Story

As a **user**,  
I'm able to see a bracket overview of the tournament,  
So that I can follow the current stage, results, and the final winner.

## Roles Involved

- **USER** (authenticated) — full bracket view
- **REFEREE** / **ADMIN** — same access
- **GUEST** — can view current round fixtures only (no full bracket detail)

## Acceptance Criteria

- Overview shows all stages, their matches, and match status
- Current active stage is clearly highlighted
- Completed matches display the final score
- Final winner is clearly shown when the `Final` stage match is `FINISHED`
- Bracket reflects live data (auto-updates as results are submitted)
- Guest users can view upcoming fixtures but not the full bracket/statistics

## Wireframe

```text
+------------------------------------------------------+
| Tournament Bracket - World Cup 2026                  |
+------------------------------------------------------+
| 8th Final      Quarterfinal   Semifinal    Final     |
|                                                      |
| NED 2-1 GER  -> NED vs BRA  -> NED vs ESP -> NED    |
| ARG 3-0 USA  -> ARG vs FRA  -> ARG vs POR ->        |
| ESP 1-0 BRA  -> ESP vs ENG  ->                      |
| ...                                                  |
|                                                      |
| Current stage: Quarterfinal  [highlighted]           |
|                                                      |
| WINNER: Netherlands  (shown after Final is FINISHED) |
+------------------------------------------------------+
```

## Domain Model Reference (schema.prisma)

| Model   | Key fields used                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------- |
| `Match` | `roundOrderNumber`, `roundName`, `homeTeamId`, `awayTeamId`, `homeScore`, `awayScore`, `status` |
| `Team`  | `id`, `name`, `countryFlag`, `countryShortName`                                                 |

## Business Rules

- Active stage = the stage with at least one match in `IN_PROGRESS` or `NOT_STARTED`, or the highest `roundOrderNumber` with any non-`PLANNED` match
- Final winner = winner of the match with `roundName = "Final"` and `status = "FINISHED"`
- `UserRole.GUEST` is restricted to the current-round fixture list only
