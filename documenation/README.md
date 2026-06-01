# Tournament Manager - Study Documentation (Multi-Page)

This folder contains a detailed, multi-page learning guide for the Tournament Manager project.

## How To Use This Documentation

Read the pages in order:

1. `01-architecture.md`
2. `02-data-model-erd.md`
3. `03-backend-api-rules.md`
4. `04-frontend-state-ui.md`
5. `05-workflows-sequences.md`
6. `06-learning-path.md`

HTML version:

1. `index.html`
2. `01-architecture.html`
3. `02-data-model-erd.html`
4. `03-backend-api-rules.html`
5. `04-frontend-state-ui.html`
6. `05-workflows-sequences.html`
7. `06-learning-path.html`

## What You Will Learn

- Why the project is structured in layers
- How the data model works (ERD + constraints)
- How business rules are enforced in backend services
- How frontend pages map to roles and workflows
- How match and stage progression works end-to-end
- How to study and explain the project in an evaluation/demo

## Quick Project Snapshot

- **Backend:** Express + TypeScript + Prisma + PostgreSQL
- **Frontend:** Next.js + TypeScript + SWR
- **Auth:** JWT-based, role-aware access
- **Main roles:** ADMIN, REFEREE, GUEST
- **Match statuses:** NOT_STARTED, IN_PROGRESS, COMPLETED
