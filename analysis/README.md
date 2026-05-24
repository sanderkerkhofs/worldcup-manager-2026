# Project Documentation - worldcup-manager-2026

This folder contains the cleaned project analysis deliverables for the school project.

Last updated: 2026-05-24

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

## Notes

- Project scope is intentionally simplified for school delivery: knockout-only flow with fixed rounds.
- Project operates on one fixed competition only (worldcup-manager-2026).
- Admin initiates rounds in order and updates teams within those rounds.
- Referee updates match status and goals/results within active rounds.
- Competition metadata (name, year, host country) is fixed through app configuration.
- Fixed bracket starts at 16th Final (16th Final -> Round of 16 -> Quarterfinals -> Semifinals -> Final).
- Conceptual model keeps one fixed competition and does not store competition metadata as a database entity.
- Round lifecycle used across documentation: not started -> active -> completed.
- Roles are explicitly modeled: admin (full CRUD), coach (player availability management), referee (match status/goals updates), guest (public read-only).
- Referee match updates include scored-by-player data for later top-scorer ranking.
- Dedicated Player entity with unique player ID is part of the analysis model for top-scorer ranking.
- Assigned referee can only update assigned match results; admin can update all match results.
- Teams and players are seeded into the database to simplify demo/testing scenarios.
- All diagrams are editable in diagrams.net / draw.io.
- Selected implementation stack: React + Next.js frontend, Node.js + Express.js backend, Prisma ORM, PostgreSQL database.
