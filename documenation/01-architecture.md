# 01 - Architecture

## 1. High-Level Architecture

Tournament Manager follows a classic client-server setup:

- **Frontend (Next.js)** renders pages and calls API endpoints.
- **Backend (Express)** exposes role-based endpoints and business rules.
- **Database (PostgreSQL + Prisma)** stores persistent competition data.

## 2. Layered Backend Design

The backend uses a layered structure:

- **Controller layer**
  - Handles HTTP requests/responses.
  - Validates auth and roles through middleware.
  - Delegates logic to services.

- **Service layer**
  - Contains business rules and workflow validation.
  - Coordinates multiple repository/Prisma operations.
  - Enforces domain invariants (knockout-specific constraints).

- **Model layer**
  - Domain objects with constructor-level validation.
  - Protects data correctness when mapping DB rows to domain entities.

- **Repository/Prisma layer**
  - Uses Prisma client for DB access.

This separation makes the code easier to test, reason about, and extend.

## 3. Frontend Design

The frontend is organized by responsibility:

- **pages/**: route-level pages (`/`, `/login`, `/rounds/[id]`, `/matches/[matchId]`, etc.). The `/rounds` overview route redirects to `/`.
- **components/**: reusable panels/forms/layout pieces
- **services/**: typed API calls (`getOverview`, `updateMatchStatus`, ...)
- **lib/**: session state and helper utilities
- **styles/**: global styling

## 4. Cross-Cutting Concerns

### Authentication and Authorization

- JWT token is issued after login.
- Token is attached for protected API requests.
- Backend middleware enforces role checks.

### Error Handling

- Services throw typed errors (`ValidationError`, `NotFoundError`, `ForbiddenError`).
- Global Express error middleware returns consistent API errors.

### API Documentation

- Swagger UI is exposed at `/api-docs`.
- This provides a live contract for request/response structures.

## 5. Request Lifecycle (Example)

For `PATCH /api/matches/:matchId/status`:

1. Request reaches `matchController`.
2. Auth middleware decodes JWT.
3. Role middleware allows ADMIN or REFEREE.
4. `matchService.updateMatchStatus` enforces rules.
5. Prisma updates DB.
6. Domain model maps response.
7. Controller returns JSON.

## 6. Why This Architecture Works For This Project

- **Knockout rules are strict** -> service layer centralizes validation.
- **Multiple user roles** -> middleware + role checks keep access clear.
- **Rich UI workflows** -> typed frontend services avoid API scattering.
- **Frequent reseeding/testing** -> Prisma + seed script simplify repeatability.
