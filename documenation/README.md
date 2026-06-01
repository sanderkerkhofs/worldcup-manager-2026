# World Cup Manager 2026 - Documentation

Complete multi-page learning guide for the World Cup Manager 2026 tournament management system.

## How To Use This Documentation

Read the pages in order:

1. **[01-architecture.md](01-architecture.md)** - System design and layered architecture
2. **[02-data-model-erd.md](02-data-model-erd.md)** - Database schema and entity relationships
3. **[03-backend-api-rules.md](03-backend-api-rules.md)** - Complete API reference and business rules
4. **[04-frontend-state-ui.md](04-frontend-state-ui.md)** - Frontend architecture, pages, and state management
5. **[05-workflows-sequences.md](05-workflows-sequences.md)** - End-to-end workflows and sequence diagrams
6. **[06-learning-path.md](06-learning-path.md)** - Study guide for understanding and evaluating the project

## HTML Versions (With Formatting)

For better presentation with formatting and diagrams:

- [index.html](index.html) - Documentation index
- [01-architecture.html](01-architecture.html)
- [02-data-model-erd.html](02-data-model-erd.html)
- [03-backend-api-rules.html](03-backend-api-rules.html)
- [04-frontend-state-ui.html](04-frontend-state-ui.html)
- [05-workflows-sequences.html](05-workflows-sequences.html)
- [06-learning-path.html](06-learning-path.html)
- [project-documentation.html](project-documentation.html) - Main overview

## What You Will Learn

From these documentation pages, you will understand:

### Architecture

- **Layered backend design** (Controllers → Services → Models → Repository)
- **Separation of concerns** - why each layer exists
- **Multi-layer authorization** - route-level, service-level, frontend-level
- **Request/response lifecycle** - how data flows through the system

### Data Model

- **Core entities** (User, Team, Player, Match, Goal)
- **Entity relationships** - foreign keys, constraints
- **Match lifecycle** - status transitions and progression rules
- **Role-based data visibility**

### API & Business Rules

- **Complete API reference** - all endpoints, parameters, responses
- **Business rule enforcement** - knockout constraints, stage progression
- **Error handling** - typed errors, consistent responses
- **Security model** - JWT, role-based access control

### Frontend

- **Page structure** - role-based access, page responsibilities
- **State management** - session, authentication, SWR data fetching
- **API service layer** - typed service functions
- **UI patterns** - components, styling, error handling

### Workflows

- **Tournament simulation** - admin flow from start to finish
- **Referee match updates** - assigned match workflow
- **User viewing** - read-only tournament access
- **Guest access** - limited unauthenticated viewing

### Learning Path

- **How to study the project** - recommended order and focus areas
- **How to evaluate the project** - key concepts to demonstrate
- **How to extend the project** - areas for future development

## Quick Project Snapshot

| Aspect                | Details                                           |
| --------------------- | ------------------------------------------------- |
| **Backend**           | Express + TypeScript + Prisma + PostgreSQL        |
| **Frontend**          | Next.js + React + TypeScript + SWR                |
| **Authentication**    | JWT-based, case-insensitive username              |
| **User Roles**        | ADMIN, REFEREE, USER, GUEST                       |
| **Tournament Format** | 4-round knockout (8th Final → QF → SF → Final)    |
| **Teams**             | 16 pre-seeded national teams                      |
| **Match Statuses**    | PLANNED, NOT_STARTED, IN_PROGRESS, FINISHED       |
| **Key Feature**       | Tournament simulation with auto-generated results |

## Document Purposes

- **01-architecture.md**: Understand WHY the system is structured this way
- **02-data-model-erd.md**: Understand WHAT data exists and how it relates
- **03-backend-api-rules.md**: Understand HOW to use the API and what rules it enforces
- **04-frontend-state-ui.md**: Understand HOW the frontend works and integrates with backend
- **05-workflows-sequences.md**: Understand WHEN and WHERE things happen in complete flows
- **06-learning-path.md**: Know HOW TO STUDY and DEMONSTRATE understanding

## Key Files by Documentation

| Document                  | Related Code                                                                |
| ------------------------- | --------------------------------------------------------------------------- |
| 01-architecture.md        | `back-end/`, `front-end/`, `back-end/util/middleware.ts`                    |
| 02-data-model-erd.md      | `back-end/repository/prisma/schema.prisma`, `back-end/model/`               |
| 03-backend-api-rules.md   | `back-end/controller/`, `back-end/service/`                                 |
| 04-frontend-state-ui.md   | `front-end/pages/`, `front-end/services/`, `front-end/lib/`                 |
| 05-workflows-sequences.md | `back-end/service/tournamentService.ts`, `back-end/service/matchService.ts` |
| 06-learning-path.md       | All files                                                                   |

## Project Links

- **GitHub:** [project-sem-2-sanderkerkhofs](https://github.com/yourusername/project-sem-2-sanderkerkhofs)
- **Swagger API Docs:** `http://localhost:3000/api-docs`
- **Frontend App:** `http://localhost:8080`
- **Backend Status:** `http://localhost:3000/status`

## Notes

- All documentation is updated to match the current codebase (June 2026)
- Code examples are simplified for clarity; refer to source files for complete implementation
- Diagrams are in draw.io format (editable in `analysis/` folder)
- See main [README.md](../README.md) for quick setup and usage instructions
