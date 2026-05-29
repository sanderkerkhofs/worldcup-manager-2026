# 02 — Backend Architecture

> **How the server is organised in layers, and what each layer does.**

---

## The Layered Architecture pattern

The back-end is organised into **4 layers**. Each layer has one clear responsibility and only talks to the layer directly below it.

```
🌐  Controller Layer  ← HTTP request comes in here
        ⬇ calls
⚙️  Service Layer     ← business logic lives here
        ⬇ calls
🗃️  Repository/Prisma ← talks to the database
        ⬇ maps to
🏗️  Domain Model      ← pure TypeScript classes with validation
```

Why separate layers? It makes code easier to **test**, **change**, and **understand**. If the database changes, only the repository layer needs updating. If a business rule changes, only the service layer changes.

---

## Layer 1: Controller (Routes)

**Files:** `back-end/controller/`

The controller layer is the **entry point** for every HTTP request. Its only jobs are:

1. Define which URL + HTTP method maps to which handler function
2. Read data from the incoming request (`req.body`, `req.params`)
3. Call the appropriate service function
4. Send the response back to the client
5. Protect routes using middleware (authentication / authorisation)

Controllers do **not** contain business logic or database queries.

```ts
// back-end/controller/matchController.ts

// GET /api/matches — anyone can see the match list
matchRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const matches = await listMatches(); // calls service
    res.json(matches); // sends JSON response
  }),
);

// PATCH /api/matches/:matchId/status — only admins and referees
matchRouter.patch(
  "/:matchId/status",
  authenticateToken, // middleware: must be logged in
  requireRoles("ADMIN", "REFEREE"), // middleware: must have right role
  asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req);
    const match = await updateMatchStatus(
      req.params.matchId,
      req.body.status,
      user,
    );
    res.json(match);
  }),
);
```

### Controllers in this project

| File                      | URL prefix         | Responsibility                                  |
| ------------------------- | ------------------ | ----------------------------------------------- |
| `authController.ts`       | `/api/auth`        | Register, login, get current user               |
| `tournamentController.ts` | `/api/competition` | Competition overview, rounds, simulation, reset |
| `matchController.ts`      | `/api/matches`     | Match CRUD, goals, top scorers                  |
| `playerController.ts`     | `/api/players`     | Player listing, status updates                  |
| `userController.ts`       | `/api/users`       | Admin user management                           |

---

## Layer 2: Service (Business Logic)

**Files:** `back-end/service/`

The service layer contains the **real business logic** — the rules that make this a "World Cup manager" rather than a generic data API.

Examples of business logic:

- A referee can only update **their own assigned match**
- Match status can only move forward: `NOT_STARTED` → `IN_PROGRESS` → `FINISHED`
- A round is **locked** until all matches in the previous round are `COMPLETED`
- When a round finishes, winners are automatically placed into the next round
- Knockout matches cannot end in a draw

```ts
// service/matchService.ts — status transition enforcement
function assertStatusTransition(matchStatus, nextStatus, actor) {
  if (actor.role !== "REFEREE") return; // Admins can do anything

  if (nextStatus !== "IN_PROGRESS" && nextStatus !== "FINISHED") {
    throw new ValidationError(
      "Referees can only set a match to IN_PROGRESS or FINISHED.",
    );
  }

  if (
    nextStatus === "IN_PROGRESS" &&
    matchStatus !== "PLANNED" &&
    matchStatus !== "NOT_STARTED"
  ) {
    throw new ValidationError(
      "Referees can only set IN_PROGRESS from PLANNED or NOT_STARTED.",
    );
  }
}
```

### Services in this project

| File                         | Responsibility                                                 |
| ---------------------------- | -------------------------------------------------------------- |
| `authService.ts`             | Register, login, password hashing, JWT issuance                |
| `tournamentService.ts`       | Competition overview, standings calculation, simulation, reset |
| `matchService.ts`            | Match updates, goal tracking, score recalculation              |
| `playerService.ts`           | Player listing and availability status                         |
| `userService.ts`             | Admin user management                                          |
| `roundProgressionService.ts` | Auto-advances the knockout bracket when a round finishes       |

---

## Layer 3: Domain Model (Classes)

**Files:** `back-end/model/`

TypeScript classes that represent business entities. Each class validates its own data in the `constructor` — invalid objects cannot be created.

```ts
// model/player.ts
export class Player {
  constructor({ id, shirtNumber, teamId, firstName, ...}) {
    // Validation — throws if rules are violated
    if (!teamId.trim()) throw new ValidationError('Player must belong to a team.');
    if (!Number.isInteger(shirtNumber) || shirtNumber <= 0)
      throw new ValidationError('Shirt number must be a positive integer.');

    // All fields are readonly — cannot be changed after creation
    this.id = id;
    this.shirtNumber = shirtNumber;
  }

  // Factory method: converts a Prisma DB row into a domain object
  static from(prismaPlayer: PrismaPlayer): Player {
    return new Player({ ...prismaPlayer });
  }
}
```

### Domain models

| Class    | Key validation rules                                     |
| -------- | -------------------------------------------------------- |
| `Team`   | Name, country, coach must not be blank                   |
| `Player` | Must have a team; shirt number > 0; valid status         |
| `Match`  | Teams must be different; valid status; valid date        |
| `Goal`   | Must reference valid match, player, and team             |
| `User`   | Username required; valid role (ADMIN/REFEREE/USER/GUEST) |

---

## Layer 4: Repository / Prisma

**Files:** `back-end/repository/prisma/`

The thin bridge between service layer and database. Prisma provides the actual database operations.

```ts
// Find one record
const match = await prisma.match.findUnique({ where: { id: matchId } });

// Find many with filters and ordering
const matches = await prisma.match.findMany({
  where: { roundOrderNumber: 1 },
  orderBy: { matchDate: 'asc' },
});

// Create
await prisma.user.create({ data: { username, passwordHash, role: 'USER' } });

// Update
await prisma.match.update({ where: { id: matchId }, data: { status: 'IN_PROGRESS' } });

// Transaction (all succeed or all fail together)
await prisma.$transaction(async (tx) => {
  await tx.match.update({ ... });
  await tx.goal.deleteMany({ ... });
});
```

---

## Middleware

**File:** `back-end/util/middleware.ts`

Middleware functions run between the request arriving and the route handler.

### authenticateToken

Reads `Authorization: Bearer <token>`, verifies the JWT, attaches the user to `req.user`.

### requireRoles(...roles)

A middleware factory — returns a middleware that checks the user's role.

```ts
matchRouter.patch(
  "/:id/status",
  authenticateToken, // step 1: must be logged in
  requireRoles("ADMIN", "REFEREE"), // step 2: must have right role
  asyncHandler(handler), // step 3: the actual logic
);
```

### asyncHandler

Wraps async route handlers so thrown errors automatically reach `errorHandler`.

### errorHandler

A global error handler that returns consistent JSON error responses:

| Error class         | HTTP status      |
| ------------------- | ---------------- |
| `ValidationError`   | 400 Bad Request  |
| `UnauthorizedError` | 401 Unauthorized |
| `ForbiddenError`    | 403 Forbidden    |
| `NotFoundError`     | 404 Not Found    |

---

## Complete request flow example

What happens when a referee sends `PATCH /api/matches/abc123/status` with `{ "status": "IN_PROGRESS" }`:

1. **Express router** matches the URL → calls the handler chain
2. **authenticateToken** verifies the JWT, attaches `req.user = { role: 'REFEREE', ... }`
3. **requireRoles** checks role — passes because REFEREE is allowed
4. **asyncHandler** wraps the handler to catch async errors
5. **Controller** reads `req.params.matchId` and `req.body.status`, calls `updateMatchStatus()`
6. **Service** loads the match, validates the status transition for a referee, updates the DB
7. **Prisma** runs the SQL UPDATE against PostgreSQL
8. Updated match returned up through service → controller → `res.json(match)`
