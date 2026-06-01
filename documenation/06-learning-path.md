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

1. "How a stage simulation progresses the tournament"
2. "How a referee updates a match result safely"
3. "How role-based access and edit locks work together"
4. "Why all matches are pre-created at seed time"
5. "How simulation generates realistic non-draw results"

## Phase 5 - Self-Check Questions

Use these to test yourself:

1. Why are all matches pre-created at seed time instead of generated during simulation?
2. Why does the match status have both `PLANNED` and `NOT_STARTED` instead of just one?
3. What checks prevent a referee from editing a second-round match before the first round is done?
4. Why are goals stored as separate events instead of only a final score?
5. How does the admin "simulate" operation differ from manual referee entry?
6. Why does the system ensure knockout matches cannot end in draws at the service layer?

## Phase 6 - Improvement Ideas (For Reflection)

to discuss in evaluation:

- Add match scheduling/date management beyond seeded matches
- Add player lineup selection (currently all players available)
- Add team substitution tracking during matches
- Add support for extra time and penalty shootouts
- Add audit logging for critical admin/referee actions
- Add real-time match updates via WebSockets
- Add progressive bracket updates (don't require full round completion)

## Quick Revision Sheet

- **Architecture:** Layered backend + service-centric rules + pre-seeded data
- **Data model:** User (ADMIN/REFEREE/USER/GUEST), Team, Player, Match (with round metadata), Goal
- **Roles:** ADMIN (full management), REFEREE (match updates, authenticated), USER (read-only, authenticated), GUEST (limited home access, unauthenticated)
- **Statuses:** PLANNED -> NOT_STARTED -> IN_PROGRESS -> FINISHED
- **Key feature:** Admin simulation auto-generates non-draw results and progression
- **Security:** JWT + role middleware + edit lock rules + referee assignment
- **Statistics:** Visible to authenticated users only (ADMIN, REFEREE, USER); hidden from GUEST
- **Core value:** Reliable role-driven tournament operations
