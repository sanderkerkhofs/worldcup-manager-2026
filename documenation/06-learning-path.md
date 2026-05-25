# 06 - Learning Path (How To Study This Project)

## Phase 1 - Understand Big Picture

Read:

- `01-architecture.md`
- `02-data-model-erd.md`

Goal:

- Explain the project in 2-3 minutes at system level.

## Phase 2 - Understand Business Rules

Read:

- `03-backend-api-rules.md`
- `05-workflows-sequences.md`

Goal:

- Explain why each validation exists (especially knockout constraints).

## Phase 3 - Understand UI Behavior

Read:

- `04-frontend-state-ui.md`

Goal:

- Trace one page from UI click -> service call -> endpoint -> database update.

## Phase 4 - Practice Demo Narratives

Practice these mini-presentations:

1. "How a stage moves from NOT_STARTED to COMPLETED"
2. "How a referee updates a match safely"
3. "How a coach changes player availability"
4. "How role-based access is enforced"

## Phase 5 - Self-Check Questions

Use these to test yourself:

1. Why is there both controller validation and service validation?
2. Why are goals stored as separate events instead of only a final score?
3. What checks prevent invalid knockout results?
4. Why does the frontend use SWR instead of direct fetch in every component?
5. What would break if `IN_PROGRESS` status was not enforced before result entry?

## Phase 6 - Improvement Ideas (For Reflection)

Potential next steps you can discuss in evaluation:

- Add audit logging for critical admin/referee actions
- Add optimistic UI for faster match editor updates
- Add pagination/filtering for large user and match lists
- Add integration tests for key role workflows
- Add migration strategy and production-ready deployment profile

## Quick Revision Sheet

- **Architecture:** Layered backend + service-centric rules
- **Data model:** User, Team, Player, Match (with round metadata), Goal
- **Statuses:** NOT_STARTED -> IN_PROGRESS -> COMPLETED
- **Security:** JWT + role middleware + contextual checks
- **Core value:** Reliable role-driven tournament operations
