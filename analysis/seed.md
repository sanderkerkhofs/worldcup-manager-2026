# Seed Data Guide

This document explains what is inserted by the current seed script in [back-end/util/seed.ts](../back-end/util/seed.ts).

## Purpose

The seed script gives a predictable starter dataset for:

- authentication/login testing
- role-based authorization testing
- match + referee assignment testing
- knockout stage progression testing
- top-scorer and goal-flow demos

## Data Model Note

There is no separate `Round` table.

Round metadata is stored directly on each match:

- `roundOrderNumber`
- `roundName`

The backend still exposes competition round endpoints using stage identifiers.

## Seed Order (Reset + Insert)

The script deletes data in dependency-safe order, then inserts fresh data.

Delete order:

1. `goal`
2. `match`
3. `player`
4. `user`
5. `team`

Insert order:

1. users (admin, coaches, multiple referees)
2. 16 teams (randomized selection from a larger pool)
3. players (15 per team)
4. precreated knockout matches for all stages

## Seeded Stage Setup

Configured knockout stages:

1. 8th Final (8 matches)
2. Quarterfinal (4 matches)
3. Semifinal (2 matches)
4. Final (1 match)

Behavior:

- Only first-stage matches start with known teams.
- Later-stage matches are precreated with null teams.
- Winners are copied forward when the previous stage is fully completed.

## Seeded Users (Examples)

- `admin` / `admin123`
- `Domenico_Tedesco` / `coach123`
- `Frank_De_Bleeckere` / `referee123`

Notes:

- Passwords are hashed with bcrypt.
- Referees are assigned to matches in rotation.
- Coach users are linked to seeded teams.

## Seeded Team and Player Data

- 16 teams are seeded per run.
- Each team has 15 players.
- Player availability is prefilled (`AVAILABLE` for primary squad, `UNAVAILABLE` for remaining players).

## Match Status Vocabulary

- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`

## How To Run Seed

From [back-end](../back-end):

```bash
npm run db:seed
```

This command force-resets the database schema and reseeds fresh demo data.
