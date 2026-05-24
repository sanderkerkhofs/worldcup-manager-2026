# School Requirements Checklist - worldcup-manager-2026

This checklist translates the additional school requirements into implementation and verification points.

## 1. Mandatory Stack

- TypeScript in backend and frontend
- Backend: Node.js + Express.js
- Frontend: React + Next.js
- ORM: Prisma
- Database: local PostgreSQL with `.env` connection config

## 2. Backend Architecture (Layered)

- Domain layer implemented
- Service layer implemented
- Controller layer implemented
- No circular dependencies in domain model

### Validation split

- Controllers: no validation logic
- Services: cross-domain and process-level validation
- Domain objects: input validation + business rules

## 3. DTO and Type Contracts

- Request payloads encapsulated in DTOs
- DTO definitions placed in `types/index.ts`
- Service layer works with domain/DTO contracts (not raw Prisma types)

## 4. Swagger Requirements

- Swagger available at `/api-docs`
- All routes documented and executable
- Controller-level component schemas are fully defined
- At least one complete route exists for each method: `GET`, `POST`, `PUT`, `DELETE`

## 5. Prisma and Database Requirements

- Prisma schema modeled and Prisma client generated
- Domain database objects query through Prisma client
- Prisma records mapped to domain objects using static `from` methods
- Prisma objects are not passed into service layer
- At least 1 one-to-many relation modeled
- At least 1 many-to-many relation modeled (Prisma + domain)
- Existing update flow: service -> domain validation -> persistence
- Team and player base data seeded in the database for lecturer/demo usage
- Dedicated `Player` table included with unique `player_id`
- Each team has at least 15 players with a simple availability status
- Fixed rounds (16th Final, Round of 16, Quarterfinals, Semifinals, Final) seeded in the database
- Multiple referee users seeded and assignable to matches

## 6. Testing Requirements (Jest)

- All domain objects fully tested, including validation
- All services fully tested
- Controllers manually tested via Swagger (no separate controller tests required)

## 7. Frontend Architecture Requirements

- Next.js app installed in `front-end` directory
- Routed pages in `pages` folder (if course requires Pages Router conventions)
- Reusable UI components in `components` folder
- Components are not directly hardcoded inside page files
- Props used for dynamic component rendering
- State used for render-persistent data (no local variable state)
- Callback functions used for child-to-parent event communication
- API calls isolated in reusable service modules (no fetch calls inside UI components)
- Dynamic routing used where relevant
- UI events used in multiple places (`onClick`, `onHover`, ...)
- Layered architecture maintained in frontend code organization

## 8. Frontend Data and Forms

- `useSWR` used for API requests
- `useEffect` used for external system interactions (browser storage, etc.)
- At least one functional form with validation, error handling, backend integration
- At least one login form with validation and error handling

## 9. Authentication and Authorization

- Register, login, logout flow implemented
- Passwords hashed with bcrypt
- JWT token-based authentication active on protected routes
- Public exceptions: login, register, status, swagger docs, and explicit project-specific exceptions
- 4 distinct roles in domain model: admin, coach, referee, guest
- At least 1 route with role-dependent behavior
- Most frontend pages protected by authentication
- At least 1 frontend page with role-dependent content
- Unauthorized access shows clear user feedback
- Browser storage used to identify user (temporary requirement)
- At least 2 values stored and reused via browser storage
- Admin has full CRUD permissions on competition management entities
- Coach can only manage own team context (player availability with available/unavailable)
- Goal scorer links use player IDs for stable top-scorer ranking logic
- Referee can only select players with available status when registering goal scorers
- Referee can insert/update match status
- Referee can insert/update match goals
- Assigned referee can only update their assigned matches
- Admin can update results for all matches
- Match result submission stores goal scorer player data
- Guest can access public read-only pages only

## 10. Lecturer Test Users

Provide predefined users visible on home/welcome page for lecturer testing:

| username | password    | role                             |
| -------- | ----------- | -------------------------------- |
| greetjej | greetjej123 | lecturer (or project equivalent) |
| elkes    | elkes123    | student (or project equivalent)  |
| johanp   | johanp123   | guest (or project equivalent)    |
| referee  | referee123  | referee                          |
| admin    | admin123    | admin                            |

If username/password does not match validation rules, show adjusted values in bold red on welcome page as requested.

## 11. Internationalization (i18n)

- At least 3 pages available in at least 2 locales
- User-friendly language switch available on those pages

## 12. Optional Topics

Optional but useful:

- Tailwind CSS

Not mandatory to apply in project now (may still be asked in defense):

- Topics listed by course as exam discussion topics

## 13. Immediate Sprint Acceptance (Current Focus)

- Read and Delete stories fully working in frontend and backend
- Swagger routes testable for each HTTP verb
- Real database (no static data)

## 14. Project-Specific Simplification Rules

- Application manages one fixed competition only for MVP scope (worldcup-manager-2026).
- Competition format is knockout-only for MVP.
- Rounds are fixed (16th Final, Round of 16, Quarterfinals, Semifinals, Final).
- Admin initiates rounds in strict sequence.
- Competition metadata (name, year, host country) is fixed in app configuration.
- Teams and match status are updated inside active rounds instead of creating round structures manually.
- Match status vocabulary is standardized to: not started, active, completed.
- Winner progression to the next round happens only after required matches are completed.
- Role simplification for demo value: admin = full CRUD, coach = team lineup, referee = match status/goals entry, guest = public read-only.
- Authorization rule: assigned referee can only update assigned match results; admin can update all match results.
- Conceptual model uses one fixed competition and avoids storing competition metadata in database entities.
