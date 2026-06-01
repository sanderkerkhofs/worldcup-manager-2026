# 01 - Architecture

## 1. High-Level Architecture

World Cup Manager 2026 follows a classic layered client-server architecture:

```
┌─────────────────────────────────────────────┐
│   Frontend (Next.js + React)                │
│   ├── Pages (routes, role-based access)    │
│   ├── Components (reusable UI)             │
│   ├── Services (typed API clients)         │
│   └── Session (authentication state)       │
└──────────────┬──────────────────────────────┘
               │ JSON + JWT
┌──────────────▼──────────────────────────────┐
│   Backend (Express + TypeScript)            │
│   ├── Controllers (HTTP request handling)  │
│   ├── Services (business logic)            │
│   ├── Models (domain validation)           │
│   ├── Repository (Prisma ORM)              │
│   └── Middleware (auth, error handling)    │
└──────────────┬──────────────────────────────┘
               │ SQL
┌──────────────▼──────────────────────────────┐
│   Database (PostgreSQL)                     │
│   ├── Users (roles, authentication)        │
│   ├── Teams (competing nations)            │
│   ├── Players (team members, scorers)      │
│   ├── Matches (fixtures, results)          │
│   └── Goals (goal events with scorers)     │
└─────────────────────────────────────────────┘
```

## 2. Layered Backend Design

The backend uses a **4-layer architecture** for separation of concerns:

### 2.1 Controller Layer

**Location:** `back-end/controller/*.ts`

**Responsibility:**

- Handle HTTP requests and responses
- Parse request parameters, body, and headers
- Validate JWT authentication (middleware)
- Check user roles and permissions (middleware)
- Delegate business logic to services
- Format and return responses (200, 201, 204, 400, 401, 403, 404, 422)

**Example:**

```typescript
matchRouter.patch(
  "/:matchId/status",
  authenticateToken, // JWT validation
  requireRoles("ADMIN", "REFEREE"), // Role check
  async (req, res) => {
    const user = getAuthenticatedUser(req);
    const match = await updateMatchStatus(
      req.params.matchId,
      req.body.status,
      user,
    );
    res.json(match);
  },
);
```

### 2.2 Service Layer

**Location:** `back-end/service/*.ts`

**Responsibility:**

- Implement business rules and workflows
- Coordinate multiple data operations
- Enforce domain constraints (knockout rules, stage progression)
- Validate data before persistence
- Handle authorization at context level (e.g., referee assigned to match?)

**Key Services:**

- `authService.ts` - User registration, login, token generation
- `tournamentService.ts` - Simulation, reset, round progression
- `matchService.ts` - Match CRUD, status transitions, goal management
- `playerService.ts` - Player data, top-scorer calculations
- `roundProgressionService.ts` - Auto-advance to next round
- `userService.ts` - User administration

**Example Business Rule Enforcement:**

```typescript
// Service enforces: only ADMIN or assigned REFEREE can update
if (user.role === "REFEREE" && match.refereeId !== user.id) {
  throw new ForbiddenError("You are not assigned to this match");
}

// Service enforces: no draws in knockout
if (homeScore === awayScore) {
  throw new ValidationError("Knockout matches cannot end in a draw");
}
```

### 2.3 Model Layer (Domain Models)

**Location:** `back-end/model/*.ts`

**Responsibility:**

- Define entity constructors with validation
- Protect data invariants at creation time
- Map database rows to domain objects
- Validate business rules before object construction

**Example:**

```typescript
// Model validates match can only be created with valid status
export const Match = (data: MatchData): Match => {
  const validStatuses = ["PLANNED", "NOT_STARTED", "IN_PROGRESS", "FINISHED"];
  if (!validStatuses.includes(data.status)) {
    throw new ValidationError(`Invalid status: ${data.status}`);
  }
  return data; // Valid, return domain object
};
```

### 2.4 Repository Layer (Prisma ORM)

**Location:** `back-end/repository/prisma/`

**Responsibility:**

- Define database schema
- Perform low-level database operations (CRUD)
- Execute migrations
- Provide type-safe data access

**Schema Entities:**

- `User` - Authentication and roles
- `Team` - Competing nations
- `Player` - Team members for goal tracking
- `Match` - Fixtures with status and results
- `Goal` - Goal events linked to players

## 3. Request/Response Lifecycle

### Example: Update Match Status

**Frontend:**

```typescript
// Service call (typed)
const result = await matchService.updateMatchStatus(matchId, "IN_PROGRESS");
// Makes: PATCH /api/matches/123/status { status: 'IN_PROGRESS' }
```

**Backend Execution Flow:**

1. **Middleware Chain:**
   - Request reaches `matchRouter.patch('/:matchId/status', ...)`
   - `authenticateToken` middleware decodes JWT, extracts user
   - `requireRoles('ADMIN', 'REFEREE')` middleware checks role

2. **Controller:**
   - `matchController` handler invoked
   - Extracts `matchId` from URL param, `status` from request body
   - Gets authenticated `user` from request context
   - Calls `matchService.updateMatchStatus(matchId, status, user)`

3. **Service:**
   - Validates referee is assigned to match (if REFEREE)
   - Fetches current match from repository
   - Validates status transition is allowed
   - Checks business rules (e.g., round completion, knockout constraints)
   - Calls `prisma.match.update(...)` to persist change

4. **Repository:**
   - Prisma executes SQL UPDATE
   - Returns updated row

5. **Return Path:**
   - Service wraps row in domain model (validation)
   - Controller serializes to JSON
   - HTTP 200 OK response with updated match

**Frontend:**

```typescript
// SWR hook receives updated data
const { data: match } = useSWR(`/api/matches/${matchId}`, fetcher);
// UI re-renders with new status
```

## 4. Authentication & Authorization Strategy

### 4.1 JWT Flow

1. **Login:** `POST /api/auth/login` → Server issues JWT token
2. **Client Storage:** Token stored in browser localStorage
3. **Requests:** Token sent in `Authorization: Bearer <token>` header
4. **Validation:** Backend middleware decodes and validates JWT
5. **User Extraction:** User ID and role extracted from JWT payload

### 4.2 Role-Based Access Control

**Routes Protected By Role:**

| Endpoint                                  | ADMIN | REFEREE | USER | GUEST |
| ----------------------------------------- | ----- | ------- | ---- | ----- |
| POST /api/auth/login                      | ✓     | ✓       | ✓    | ✓     |
| GET /api/matches                          | ✓     | ✓       | ✓    | ✓     |
| PATCH /api/matches/:id/status             | ✓     | ✓\*     | ✗    | ✗     |
| POST /api/competition/rounds/:id/simulate | ✓     | ✗       | ✗    | ✗     |
| POST /api/competition/reset-matches       | ✓     | ✗       | ✗    | ✗     |
| GET /api/users                            | ✓     | ✗       | ✗    | ✗     |
| DELETE /api/users/:id                     | ✓     | ✗       | ✗    | ✗     |

\*Referee can only update assigned matches (service-level check)

### 4.3 Multi-Level Authorization

**Route-Level:** Middleware blocks wrong roles early
**Service-Level:** Business logic validates context (e.g., assignment)
**Frontend-Level:** UI conditionally shows/hides controls based on role

## 5. Data Flow Architecture

### Tournament Simulation Flow

```
Admin clicks Simulate Round
    ↓
Frontend: POST /api/competition/rounds/1/simulate
    ↓
Controller: validateAdmin, delegate to service
    ↓
Service:
  1. Fetch round 1 matches
  2. Validate previous round is FINISHED (or is first round)
  3. Generate non-draw results for each match
  4. For each generated result:
     - Update match score
     - Create Goal records for scorers
  5. Mark all matches as FINISHED
  6. Auto-populate round 2 teams from winners
  7. Auto-advance to round 2 via roundProgressionService
    ↓
Prisma: Execute multi-step transaction
    ↓
Response: Simulated round data with new results
    ↓
Frontend: Re-fetch data, update UI
```

### Referee Match Update Flow

```
Referee enters score & goals
    ↓
Frontend: PUT /api/matches/123/result
    ↓
Controller: validateAuthenticated, validateReferee, delegate
    ↓
Service:
  1. Verify referee is assigned to match
  2. Validate score (no draw)
  3. Validate goal scorers belong to teams
  4. Update match score
  5. Create/update Goal records
  6. Check if all round 1 matches now FINISHED
  7. If yes, auto-trigger round 2 advancement
    ↓
Prisma: UPDATE match, INSERT/UPDATE goals
    ↓
Response: Updated match with goals
    ↓
Frontend: Update Referee queue, show success
```

## 6. Error Handling Architecture

**Typed Errors:**

```typescript
throw new ValidationError("Score cannot be a draw"); // 422
throw new NotFoundError("Match not found"); // 404
throw new ForbiddenError("Not assigned to this match"); // 403
throw new UnauthorizedError("Invalid token"); // 401
```

**Global Error Handler Middleware:**

```typescript
// Catches all errors, formats response
app.use(errorHandler);
// Returns: { error: string, code: string, statusCode: number }
```

**Frontend Error Handling:**

```typescript
// Service catches errors, displays toast
try {
  await updateMatch();
} catch (err) {
  toast.error(err.message); // "Score cannot be a draw"
}
```

## 7. Why This Architecture Works

**Scalability:**

- Layers allow independent testing of business logic
- Services can be composed and reused
- Easy to add new endpoints or features

**Maintainability:**

- Clear separation: Controllers don't know database, Services don't know HTTP
- Business rules centralized in services
- Changes to database only affect repository layer

**Testability:**

- Services can be tested without HTTP/Express
- Models validate independently
- Mock repository for service tests

**Security:**

- Multi-layer auth checks (middleware + service)
- Domain models prevent invalid states
- Type safety prevents injection attacks

**Learning Value:**

- Classic layered architecture pattern
- Role-based access control (RBAC) example
- JWT authentication flow
- Domain-driven design principles
