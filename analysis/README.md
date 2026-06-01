# Project Documentation - worldcup-manager-2026

This folder contains the cleaned project analysis deliverables for the school project.

Last updated: 2026-06-01

## Contents

- `project_plan.md` - End-to-end analysis and implementation plan
- `project_schema.md` - Central schema document (entities, relationships, UML, conceptual ERD, logical ERD)
- `project_pitch.md` - Final project pitch
- `user_stories.md` - User stories with acceptance criteria
- `seed.md` - Seed data overview, roles, and example records
- `uml-class-diagram.drawio` - UML class diagram (draw.io source)
- `erd-conceptual.drawio` - Conceptual ERD (draw.io source)
- `erd-logical.drawio` - Logical ERD with keys and data types (draw.io source)
- `architecture-stack.drawio` - Technical architecture diagram (Next.js -> Express -> Prisma -> PostgreSQL)
- `school-requirements-checklist.md` - Detailed checklist for technical and architectural school requirements
- `backend-layered-architecture.drawio` - Backend layered architecture (Domain -> Services -> Controllers -> Routes)
- `buisness_logic.md` - Simplified business rules, roles, and match lifecycle

## Notes

- Project scope is intentionally simplified for school delivery: knockout-only flow with fixed stages.
- Project operates on one fixed competition only (worldcup-manager-2026).
- All matches are pre-created at seed time with assigned teams (first stage) or undefined teams (later stages).
- Admin simulates stages to progress the tournament, auto-generating realistic results with non-draw outcomes.
- Referee updates match status and goals/results within stage progression rules.
- Competition metadata (name, year, host country) is fixed through app configuration.
- Fixed bracket starts at 8th Final (8th Final -> Quarterfinal -> Semifinal -> Final).
- Conceptual model keeps one fixed competition and does not store competition metadata as a database entity.
- Stage lifecycle: PLANNED -> NOT_STARTED -> IN_PROGRESS -> FINISHED (at the match level).
- Roles are explicitly modeled: ADMIN (simulation, reset, user management), REFEREE (match updates, authenticated), USER (authenticated, read-only), GUEST (unauthenticated, limited home access).
- Referee match updates include scored-by-player data for top-scorer ranking.
- Dedicated Player entity with unique player ID is part of the model for top-scorer ranking.
- Assigned referee can only update assigned match results; admin can update all match results.
- Teams and players are seeded into the database to simplify demo/testing scenarios.
- All diagrams are editable in diagrams.net / draw.io.
- Selected implementation stack: React + Next.js frontend, Node.js + Express.js backend, Prisma ORM, PostgreSQL database.
