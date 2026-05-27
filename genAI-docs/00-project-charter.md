# 00 - Project Charter

## Product name

worldcup-manager-2026

## Product goal

Build a full-stack tournament manager for one fixed World Cup style knockout competition.

The app must support:

- tournament progression from 8th Final to Final
- role-based actions (admin, referee, user, guest)
- match management, scoring, and goal scorer tracking
- public competition overview, bracket state, and statistics

## Primary users

- Admin: manages tournament flow and users
- Referee: manages assigned match status/results/goals
- User: authenticated viewer (same read rights as guest plus protected pages if required)
- Guest: public read-only access

## Scope boundaries

### In scope

- One fixed competition only (no multi-tournament CRUD)
- Fixed rounds: 8th Final, Quarterfinal, Semifinal, Final
- Pre-seeded stage matches
- Automated winner progression to next stage
- Top scorers from goal events
- Role-based backend authorization and frontend route visibility
- Local process run with pre-running PostgreSQL

### Out of scope

- Penalty shootouts and extra-time model
- Multi-season and multi-competition support
- Advanced analytics beyond standings and top scorers
- Payment, notifications, social features

## Canonical domain decisions

- Competition metadata is config-driven, not a database entity.
- Stage metadata is stored on Match (`roundOrderNumber`, `roundName`).
- Knockout matches cannot end in draw.
- Goal registration is player-based (stable player id reference).
- Next round can only unlock after previous round fully completed.

## Architecture constraints

- Backend: Node.js + Express + TypeScript
- Frontend: Next.js (Pages Router) + TypeScript
- Database: PostgreSQL + Prisma
- Auth: JWT + bcrypt password hashing
- API docs: Swagger at `/api-docs`
- Security middleware: Helmet + CORS
- Tests: Jest (domain and service layers)

## Quality goals

- Clear layered architecture
- Predictable API contracts
- Easy AI reproducibility
- Simple but strict business rule enforcement
- Human-editable markdown documentation as single source of truth
