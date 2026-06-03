# US-01 Seed Fixed Stage Matches

## User Story

As an **admin**,  
I'm able to have fixed stage matches seeded in the database,  
So that I can see the full competition structure without manual setup.

## Roles Involved

- **ADMIN** — views pre-seeded stage structure

## Acceptance Criteria

- System seeds fixed stage matches in the database for the competition at startup
- Default stage order is fixed: `8th Final` → `Quarterfinal` → `Semifinal` → `Final`
- Each stage match is pre-created with status `PLANNED`
- Admin can see all stage matches immediately after seeding
- First-stage matches have teams assigned; later stage matches start with unknown teams

## Wireframe

```text
+------------------------------------------------------+
| Competition Setup - Stages                           |
+------------------------------------------------------+
| Pre-created stage matches                            |
| 1. 8th Final            Status: PLANNED              |
| 2. Quarterfinal         Status: PLANNED              |
| 3. Semifinal            Status: PLANNED              |
| 4. Final                Status: PLANNED              |
+------------------------------------------------------+
```

## Domain Model Reference (schema.prisma)

| Field              | Type          | Notes                             |
| ------------------ | ------------- | --------------------------------- |
| `id`               | String (CUID) | Primary key                       |
| `roundOrderNumber` | Int           | Determines stage ordering         |
| `roundName`        | String        | "8th Final", "Quarterfinal"...    |
| `homeTeamId`       | String?       | FK → Team (null for later stages) |
| `awayTeamId`       | String?       | FK → Team (null for later stages) |
| `status`           | MatchStatus   | Default: `PLANNED`                |
| `matchDate`        | DateTime      | Pre-configured at seed time       |
