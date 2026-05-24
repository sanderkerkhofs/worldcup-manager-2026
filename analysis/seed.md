# Seed Data Guide

This document explains exactly what is inserted by the current seed script in [back-end/util/seed.ts](../back-end/util/seed.ts).

## Purpose

The seed script gives you a predictable starter dataset for:

- authentication/login testing
- role-based authorization testing
- match + referee assignment testing
- quick Swagger/demo flows
- future top-scorer ranking flows (player-level IDs)

## Analysis Update: Dedicated Player Table

For the approved analysis model, a dedicated `Player` table is required.

Planned core fields:

- `player_id` (primary key)
- `team_id` (foreign key to Team)
- `first_name`
- `last_name`
- `shirt_number`
- `position`
- `status` (fixed values: available, unavailable)

Goal scorer registrations must reference `player_id` so top-scorer ranking is deterministic and stable over time.

Each team should have at least 15 seeded players so coach availability management is meaningful in the analysis model.

Note:

- Backend/frontend implementation will be recreated later after analysis approval.
- This document currently describes the seed intent and analysis design direction only.

## Seed Order (Reset + Insert)

The script first deletes data in dependency-safe order, then inserts fresh data.

Delete order:

1. `match`
2. `round`
3. `team`
4. `user`

Insert order:

1. users (including multiple referees)
2. 32 international teams
3. one fixed competition config (`worldcup-manager-2026`)
4. rounds
5. 16th Final matches (with assigned referees)

## Seeded Users

The following users are created:

| username | password    | role      |
| -------- | ----------- | --------- |
| admin    | admin123    | ADMIN     |
| greetjej | greetjej123 | ORGANIZER |
| elkes    | elkes123    | VIEWER    |
| johanp   | elkes123    | VIEWER    |
| referee1 | referee123  | REFEREE   |
| referee2 | referee123  | REFEREE   |
| referee3 | referee123  | REFEREE   |
| referee4 | referee123  | REFEREE   |
| referee5 | referee123  | REFEREE   |
| referee6 | referee123  | REFEREE   |

Notes:

- Passwords are hashed with bcrypt before storage.
- Referees are queried and sorted by username, then assigned to matches.

## Seeded Teams

The script creates 32 national teams (real international countries), including:

- Argentina
- Brazil
- France
- Germany
- Spain
- England
- Portugal
- Netherlands
- ... (total 32)

Seed order note:

- The teams should be inserted in a randomized order if the seed script supports shuffling, so the bracket does not always start with the same country pairings.

Note:

- In the approved analysis target, players are stored in a dedicated Player table instead of embedding player-like text in team fields.
- Player status is kept simple and fixed to available/unavailable.

## Seeded Competition Config + Rounds

Current seed uses one fixed competition config:

- name: `worldcup-manager-2026`
- year: `2026`
- format: `Knockout`

Current rounds:

1. 16th Final
2. Round of 16
3. Quarterfinals
4. Semifinals
5. Final

## Seeded Team Pool

All 32 teams belong to the same fixed competition scope.

## Seeded Matches (Examples)

The script inserts 16 matches in the `16th Final` round:

- Match pairing pattern: based on the randomized team order, paired as 1 vs 2, 3 vs 4, ... up to 31 vs 32
- Referees are assigned in rotation (`referee1` to `referee6`)
- First 4 matches are seeded as `COMPLETED` with score `2-1`
- Remaining 12 matches are seeded as `SCHEDULED` with null scores

Example completed match:

- Home: Argentina
- Away: Brazil
- Status: COMPLETED
- Score: 2 - 1

Example scheduled match:

- Home: South Korea
- Away: Australia
- Status: SCHEDULED
- Score: null

## Authorization Example

Because matches have `refereeId`:

- assigned referee can update that match result
- admin can update all match results
- non-assigned referee is blocked from updating the match

## How To Run Seed

From [back-end](../back-end):

```bash
npm run seed
```

If your Prisma schema changed, run migrations and generate client first.

## Important Consistency Note

Current seed now matches the current direction:

- fixed competition `worldcup-manager-2026`
- 32 teams
- seeded `16th Final` matches
- multiple assigned referees
