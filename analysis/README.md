# Project Documentation - worldcup-manager-2026

This folder contains the cleaned project analysis deliverables for the school project.

Last updated: 2026-06-03

## Contents

### Root documents

| File                               | Description                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `project_plan.md`                  | End-to-end analysis and implementation plan                                                                               |
| `project_schema.md`                | Central schema document (entities, enums, relationships, UML, conceptual ERD, logical ERD) — derived from `schema.prisma` |
| `project_pitch.md`                 | Final project pitch                                                                                                       |
| `user_stories.md`                  | Combined user stories overview (all stories in one file)                                                                  |
| `seed.md`                          | Seed data overview, roles, and example records                                                                            |
| `buisness_logic.md`                | Simplified business rules, roles, and match lifecycle                                                                     |
| `school-requirements-checklist.md` | Detailed checklist for technical and architectural school requirements                                                    |

### User Stories — `/user_stories/`

Each user story has its own dedicated markdown file with: user story sentence, roles involved, acceptance criteria, wireframe, domain model reference, and business rules.

| File                                        | Story                                                |
| ------------------------------------------- | ---------------------------------------------------- |
| `US-01-seed-fixed-stage-matches.md`         | Admin — seed fixed stage matches at startup          |
| `US-02-automatic-stage-activation.md`       | Admin — stages activate in fixed order automatically |
| `US-03-update-matches-in-active-stage.md`   | Referee/Admin — update match status                  |
| `US-04-enter-match-results.md`              | Referee/Admin — enter goals and goal scorers         |
| `US-05-view-standings-and-top-scorers.md`   | User — view standings and top scorer rankings        |
| `US-06-progress-winners-to-next-stage.md`   | Admin — progress winners to next stage automatically |
| `US-07-view-tournament-bracket-overview.md` | User — view full tournament bracket                  |
| `US-08-guest-views-public-info-only.md`     | Guest — view public fixtures only                    |

### Diagrams — `/drawio/`

All editable draw.io diagrams. Open with [diagrams.net](https://app.diagrams.net/) or the VS Code draw.io extension.

| File                                  | Description                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| `uml-class-diagram.drawio`            | UML class diagram — User, Team, Match, Player, Goal with all fields from schema.prisma |
| `erd-conceptual.drawio`               | Conceptual ERD — entity relationships with cardinalities                               |
| `erd-logical.drawio`                  | Logical ERD — tables with all fields, types, PKs, FKs, and enums                       |
| `architecture-stack.drawio`           | Technical architecture diagram (Next.js → Express → Prisma → PostgreSQL)               |
| `backend-layered-architecture.drawio` | Backend layered architecture (Controllers → Services → Domain → Repository)            |

> **Note:** The `.drawio` files at the analysis root are legacy copies. The `/drawio/` folder contains the up-to-date versions that reflect the actual `schema.prisma`.

## Notes

- Project scope is intentionally simplified for school delivery: knockout-only flow with fixed stages.
- Project operates on one fixed competition only (worldcup-manager-2026).
- All matches are pre-created at seed time with assigned teams (first stage) or undefined teams (later stages).
- Admin simulates stages to progress the tournament, auto-generating realistic results with non-draw outcomes.
- Referee updates match status and goals/results within stage progression rules.
- Competition metadata (name, year, host country) is fixed through app configuration.
- Fixed bracket starts at 8th Final (8th Final → Quarterfinal → Semifinal → Final).
- Match lifecycle: `PLANNED` → `NOT_STARTED` → `IN_PROGRESS` → `FINISHED` (match level).
- Roles: `ADMIN` (simulation, reset, user management), `REFEREE` (match updates), `USER` (read-only authenticated), `GUEST` (unauthenticated, limited).
- `Goal` model has no `minute` field — goals are recorded with `createdAt` only.
- Stack: React + Next.js frontend, Node.js + Express.js backend, Prisma ORM, PostgreSQL database.
