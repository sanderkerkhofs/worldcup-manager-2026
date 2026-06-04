# US-05 View Standings and Top Scorers

## User Story

As a **user**,  
I'm able to view the current standings and top scorer rankings,  
So that I can follow team and player performance throughout the competition.

## Roles Involved

- **USER** (authenticated) — full access to statistics
- **ADMIN** / **REFEREE** — same access as USER for stats
- **GUEST** — no access to statistics pages

## Acceptance Criteria

- Authenticated users can view a top-scorer ranking sorted by total goals scored
- Top scorer list shows: player name, team, and goal count
- Standings table shows teams sorted by matches won/goals scored
- Data is derived from `Goal` records linked to `Player` and `Team`
- Guest users receive an access denied message when navigating to the stats page
- Statistics update automatically as results are submitted

## Wireframe

```text
+------------------------------------------------------+
| Statistics                                           |
+------------------------------------------------------+
| TOP SCORERS                                          |
| #  Player            Team        Goals               |
| 1  Lionel Messi      Argentina   5                   |
| 2  Kylian Mbappé     France      4                   |
| 3  Erling Haaland    Norway      3                   |
|                                                      |
| TEAM STANDINGS                                       |
| #  Team              W   L   GF  GA                  |
| 1  Netherlands        3   0   7   2                  |
| 2  Argentina          2   1   6   3                  |
+------------------------------------------------------+
```

## Domain Model Reference (schema.prisma)

### Relevant models for statistics

| Model    | Key fields used                                                |
| -------- | -------------------------------------------------------------- |
| `Goal`   | `playerId`, `teamId`, `matchId`                                |
| `Player` | `id`, `firstName`, `lastName`, `teamId`                        |
| `Team`   | `id`, `name`, `country`, `countryFlag`                         |
| `Match`  | `homeScore`, `awayScore`, `homeTeamId`, `awayTeamId`, `status` |

## Business Rules

- Only goals from `FINISHED` matches count toward rankings
- Top scorers ranking is derived from `Goal` records grouped by `playerId`
- `UserRole.GUEST` is denied access to the stats page
- `UserRole.USER`, `REFEREE`, and `ADMIN` all have read access
