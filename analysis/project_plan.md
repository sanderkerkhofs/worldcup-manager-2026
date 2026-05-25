# Project Plan - worldcup-manager-2026

## 1. Goal

Build a full-stack web app named worldcup-manager-2026 that manages one fixed World Cup style knockout competition (starting from 8th Final) to final winner, using clear role-based permissions (admin, coach, referee, guest).

## 2. Deliverables for Project Analysis

- Project pitch
- UML class diagram
- Conceptual ERD
- Logical ERD
- User stories with acceptance criteria

## 3. Scope

### In Scope (MVP)

- Use fixed worldcup-manager-2026 metadata from app configuration (name, year, host country)
- Seed 16 teams into the competition in randomized order
- Use fixed knockout stages (8th Final, Quarterfinal, Semifinal, Final)
- First stage starts active automatically; next stages activate after progression
- Fill/update teams in matches for active stages
- Schedule matches
- Referee inserts and updates match status (not started, active, completed)
- Referee inserts and updates goals with scored-by-player data
- Move winners to next round
- View competition bracket progress
- Role-based views for admin, coach, referee, and guest

## 4. Core Domain Model

Main entities:

- Team
- Player
- Match

Critical relationship choices:

- `Match` contains `roundOrderNumber` and `roundName`
- `Player` contains `player_id` as unique identifier and belongs to exactly one team

No competition metadata entity is required in the database because the app manages one fixed competition only.

This guarantees every match belongs to exactly one fixed stage in the competition flow without requiring a separate Round table.

## 5. Functional Requirements

- System uses fixed worldcup-manager-2026 metadata from app configuration (name, year, host country)
- Teams are seeded automatically; admin does not manually register teams for MVP
- System provides fixed knockout stages for the competition
- System auto-activates the first stage and auto-activates next stages after winners are assigned
- Admin can assign/update teams in stage matches
- Admin can schedule matches
- Coach can select players for matches of their own team
- Each team has at least 15 seeded players with a simple availability status
- Referee can insert/update match status
- Referee can insert/update match goals and scored-by-player registration
- Referee can only select goal scorers who are marked available
- Assigned referee can only update results for their assigned match
- Admin can update results for all matches
- System can compute winners and progression to the next stage
- Guest can only view public competition information (fixtures, bracket, results)
- System stores goals at player level for future top-scorer ranking

## 5.1 Role Permissions Matrix

- Admin: full CRUD rights for competition data, teams, matches, and public competition data.
- Coach: can manage player availability for own team using available/unavailable.
- Referee: can insert/update match status and match goals (including goal scorer registration) only for assigned matches.
- Guest: read-only access to public competition information.

## 6. Non-Functional Requirements

- Clear and responsive UI (desktop + mobile)
- Clear role-based access control and authorization checks per endpoint and page
- Data integrity with foreign keys and validation
- Basic security for authentication and authorization
- Test coverage for core domain logic

## 7. Proposed Technical Architecture

- Frontend: React with Next.js (Pages Router)
- Backend: Node.js with Express.js REST API
- Language: TypeScript (frontend and backend)
- ORM: Prisma
- Database: PostgreSQL
- Auth: JWT-based session
- Security middleware: Helmet
- Data fetching (frontend): useSWR

## 7.1 Implementation Notes for Chosen Stack

- Next.js provides the web client and routing for competition pages.
- Express.js exposes API endpoints consumed by the Next.js frontend.
- Prisma manages schema, migrations, and typed data access.
- PostgreSQL stores competition, team, player, and match data with relational integrity.
- Backend follows layered architecture: domain, services, controllers.
- Incoming request payloads are encapsulated in DTOs stored in `types/index.ts`.
- Swagger is available at `/api-docs`, with route docs and component schemas.

## 8. Milestone Plan

### Milestone 1 - Analysis and Design

- Finalize pitch
- Finalize user stories
- Finalize UML and ER diagrams

### Milestone 2 - Backend Foundation

- Project setup
- Express.js API structure and route modules
- Prisma schema and PostgreSQL migrations
- CRUD for competition settings, teams, and matches
- Fixed 8th Final bracket seeding (8th Final, Quarterfinal, Semifinal, Final)
- Team and player seed data inserted into the database for demo/testing (players with unique player ID and availability status)
- Teams are seeded in randomized order to avoid a fixed bracket pattern
- Multiple referees seeded and assignable per match for authorization checks
- Swagger setup and first documented routes (`/api-docs`)
- DTO contracts and typed request/response mapping

### Milestone 3 - Business Logic

- Automatic stage activation flow
- Match status transitions
- Result processing and winner progression
- Referee-owned match status and goals update flow
- Goal scorer registration on result submission
- Coach team-boundary checks for player selection
- Validation split by layer (domain vs services)
- JWT authentication, role-based authorization, Helmet security middleware

### Milestone 4 - Frontend

- Next.js project structure and shared layout
- UI for knockout dashboard
- Team and match management screens
- Bracket and stage progression views
- Role-specific screens/actions for admin, coach, referee, and guest
- Reusable API service layer + useSWR data fetching
- Dynamic routing, forms with validation, login/register/logout, browser storage integration
- Role-aware pages and unauthorized access messaging

### Milestone 5 - Testing and Delivery

- Unit and integration tests
- Final bug fixes
- Final documentation and demo prep
- Full Jest coverage for domain objects and service layer
- Manual controller verification via Swagger
- i18n support for at least 3 pages in 2 locales

## 9. Risks and Mitigation

- Stage progression consistency: enforce strict order and completion checks
- Invalid bracket setup (team count mismatch): block progression until valid pairings exist
- Incorrect role permissions: enforce backend authorization first, then mirror in frontend visibility
- Inconsistent data: enforce constraints + validation at API and DB levels
- Time pressure: prioritize MVP and keep optional features for phase 2

## 10. Definition of Done (MVP)

- worldcup-manager-2026 metadata (name, year, host country) is fixed and loaded from app configuration
- Exactly 16 teams are auto-seeded into the competition in randomized order
- Teams and players are seeded in the database for a quick project start
- Each team contains at least 15 players
- Each player has a dedicated player ID for stable goal-scoring references
- Player status is limited to available/unavailable for simple lineup and scorer selection
- Pre-created stage matches are visible, with first stage active by default and next stages auto-activated when unlocked
- Matches can be scheduled, status-updated, and scored
- Coaches can select players for their own team matches
- Referee can insert/update match status and goals
- Assigned referee can only update their assigned matches
- Admin can update results of all matches
- Match result stores scored-by-player details for future top-scorer ranking
- Guests can only access public read-only pages
- Winner progression to the next stage works correctly
- Completed final clearly exposes competition winner
- Required analysis documentation is complete and consistent

## 11. School Compliance Requirements (Integrated)

- All backend layers are implemented explicitly: domain, services, controllers.
- Controllers contain no validation logic.
- Services contain cross-entity and process-level validation.
- Domain objects contain input validation and domain business validation.
- Swagger route documentation is complete and executable at `/api-docs`.
- At least one complete route per HTTP method exists (`GET`, `POST`, `PUT`, `DELETE`) using real database data.
- Updates to entities go through domain models before persistence in the database layer.
- Prisma objects are mapped to domain objects using static `from` methods.
- Prisma objects are not leaked into the service layer.
- Prisma schema includes at least one one-to-many and one many-to-many relation.
- Frontend uses layered approach, reusable components, API services, props/state/callbacks, dynamic routes, and events.
- Frontend uses `useSWR` for API requests and `useEffect` for external system interactions.
- At least one validated business form and one validated login form exist.
- Authentication and authorization are active with JWT, role handling, and protected pages.
- At least two values are stored in browser storage and used in the app.
- Passwords are encrypted with bcrypt.
- Helmet is enabled on backend HTTP traffic.
- i18n supports at least 3 pages in at least 2 locales with a language switcher.

Detailed traceability checklist: see `school-requirements-checklist.md`.
