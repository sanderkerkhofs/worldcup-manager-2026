# 09 - AI Rebuild Playbook

This playbook gives you clean prompts to regenerate the project with AI in controlled phases.

## Usage rules

- Run one phase at a time.
- Do not ask AI to build everything in one prompt.
- Validate tests and behavior after each phase.
- Use these markdown files as hard constraints.

## Phase 0 prompt: repository scaffold

Prompt:

"Create a full-stack TypeScript monorepo with:

- back-end: Express + Prisma + PostgreSQL + Jest + Swagger
- front-end: Next.js Pages Router + SWR
- docker-compose for postgres and fullstack
  Use the architecture and constraints from genAI-docs/00-project-charter.md and genAI-docs/05-backend-architecture-api.md."

Expected outcome:

- folder structure created
- package scripts configured
- app boots with `/status`
- basic frontend page renders

## Phase 1 prompt: data model and seed

Prompt:

"Implement Prisma schema, migrations, and seed script exactly as defined in genAI-docs/04-data-model-erd.md and genAI-docs/08-seed-and-environments.md.
Include fixed rounds and deterministic validation checks after seed."

Expected outcome:

- schema generated
- migration applied
- seed populates users/teams/players/matches
- DB integrity constraints enforced

## Phase 2 prompt: auth and security

Prompt:

"Implement auth module with register/login/me, JWT middleware, role checks, bcrypt hashing, and centralized error handling according to genAI-docs/07-auth-roles-security.md."

Expected outcome:

- secure auth routes
- protected route middleware
- typed auth DTOs

## Phase 3 prompt: competition and match services

Prompt:

"Implement competition, round simulation, round progression, and match result/goal services using genAI-docs/03-domain-business-logic.md and genAI-docs/05-backend-architecture-api.md.
Use strict service-level validation for role and round-lock rules."

Expected outcome:

- all match and competition routes work
- progression logic works
- goal validation works

## Phase 4 prompt: frontend pages and services

Prompt:

"Implement Next.js pages, role-aware layout, session context, API service modules, and SWR data flow based on genAI-docs/06-frontend-architecture-layout.md.
No direct fetch in page components."

Expected outcome:

- login/register/session flows
- overview/matches/stats/admin/referee pages
- role-gated actions

## Phase 5 prompt: i18n and UX consistency

Prompt:

"Add i18n for nl/en/fr on at least three pages, language switch, and consistent status labels using genAI-docs/06-frontend-architecture-layout.md and genAI-docs/01-requirements.md."

Expected outcome:

- locale switch works
- translations visible on selected pages

## Phase 6 prompt: testing and hardening

Prompt:

"Add comprehensive domain and service tests, validate Swagger route coverage, and ensure all Definition-of-Done checks in genAI-docs/10-definition-of-done-checklist.md are passing."

Expected outcome:

- tests pass
- docs and implementation aligned
- no unresolved enum mismatch

## AI guardrail prompt (use before each phase)

"Before coding, list the exact requirements you are enforcing from genAI-docs. If any existing code conflicts, propose the cleanest consistent fix and apply it everywhere (DB types, backend types, frontend types, i18n labels)."
