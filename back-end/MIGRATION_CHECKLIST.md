# Back-End Schema Migration Checklist: CUID → Natural Keys

## Schema Changes Overview

| Entity | Old Primary Key   | New Primary Key         |
| ------ | ----------------- | ----------------------- |
| User   | id (String, CUID) | username (String)       |
| Team   | id (String, CUID) | name (String)           |
| Match  | id (String, CUID) | id (Int, autoincrement) |
| Player | id (String, CUID) | id (Int, autoincrement) |
| Goal   | id (String, CUID) | id (Int, autoincrement) |

### Foreign Key Changes

- `userId` → `username` (String)
- `refereeId` → `refereeUsername` (String)
- `teamId` → `teamName` (String)

---

## 1. back-end/types/index.ts

### Issues to Fix

#### AuthUser Type

**Location:** Line 10-15

```typescript
// CURRENT (❌ WRONG)
export type AuthUser = {
  id: string; // ← Should be 'username'
  username: string;
  role: UserRole;
  teamId: string | null; // ← Should be 'teamName'
};

// SHOULD BE (✅ CORRECT)
export type AuthUser = {
  username: string; // Changed from 'id'
  role: UserRole;
  teamName: string | null; // Changed from 'teamId'
};
```

#### PlayerCreateDto Type

**Location:** Line 41-47

```typescript
// CURRENT (❌ WRONG)
export type PlayerCreateDto = {
  teamId: string; // ← Should be 'teamName'
  firstName: string;
  lastName: string;
  shirtNumber: number;
  position: string;
};

// SHOULD BE (✅ CORRECT)
export type PlayerCreateDto = {
  teamName: string; // Changed from 'teamId'
  firstName: string;
  lastName: string;
  shirtNumber: number;
  position: string;
};
```

#### MatchCreateDto Type

**Location:** Line 54-61

```typescript
// CURRENT (❌ WRONG)
export type MatchCreateDto = {
  roundId: string;
  homeTeamId: string; // ← Should be 'homeTeamName'
  awayTeamId: string; // ← Should be 'awayTeamName'
  matchDate: string;
  refereeId?: string | null; // ← Should be 'refereeUsername'
};

// SHOULD BE (✅ CORRECT)
export type MatchCreateDto = {
  roundId: string;
  homeTeamName: string; // Changed from 'homeTeamId'
  awayTeamName: string; // Changed from 'awayTeamId'
  matchDate: string;
  refereeUsername?: string | null; // Changed from 'refereeId'
};
```

#### GoalInputDto Type

**Location:** Line 68-71

```typescript
// CURRENT (❌ WRONG)
export type GoalInputDto = {
  playerId: string; // ← Should be 'number' (autoincrement)
  teamId: string; // ← Should be 'teamName'
};

// SHOULD BE (✅ CORRECT)
export type GoalInputDto = {
  playerId: number; // Changed from 'string'
  teamName: string; // Changed from 'teamId'
};
```

#### UserResponse Type

**Location:** Line 93-101

```typescript
// CURRENT (❌ WRONG)
export type UserResponse = {
  id: string; // ← Should be removed, use username as identifier
  username: string;
  role: UserRole;
  teamId: string | null; // ← Should be 'teamName'
  createdAt: string;
  updatedAt: string;
};

// SHOULD BE (✅ CORRECT)
export type UserResponse = {
  username: string; // Now the primary identifier
  role: UserRole;
  teamName: string | null; // Changed from 'teamId'
  createdAt: string;
  updatedAt: string;
};
```

#### TeamResponse Type

**Location:** Line 103-111

```typescript
// CURRENT (❌ WRONG)
export type TeamResponse = {
  id: string; // ← Should be removed, use name as identifier
  name: string;
  country: string;
  countryShortName: string;
  countryFlag: string;
  createdAt: string;
  updatedAt: string;
};

// SHOULD BE (✅ CORRECT)
export type TeamResponse = {
  name: string; // Now the primary identifier
  country: string;
  countryShortName: string;
  countryFlag: string;
  createdAt: string;
  updatedAt: string;
};
```

#### PlayerResponse Type

**Location:** Line 113-122

```typescript
// CURRENT (❌ WRONG)
export type PlayerResponse = {
  id: string; // ← Should be 'number' (autoincrement)
  teamId: string; // ← Should be 'teamName'
  firstName: string;
  lastName: string;
  shirtNumber: number;
  position: string;
  createdAt: string;
  updatedAt: string;
};

// SHOULD BE (✅ CORRECT)
export type PlayerResponse = {
  id: number; // Changed from 'string'
  teamName: string; // Changed from 'teamId'
  firstName: string;
  lastName: string;
  shirtNumber: number;
  position: string;
  createdAt: string;
  updatedAt: string;
};
```

#### RoundResponse Type

**Location:** Line 124-130

```typescript
// CURRENT (❌ WRONG)
export type RoundResponse = {
  id: string; // ← Should this use orderNumber instead?
  name: string;
  orderNumber: number;
  createdAt: string;
  updatedAt: string;
};

// DECISION: Keep 'id' as String representation of orderNumber
// or change to: id: number (orderNumber)
// → Recommend: change to orderNumber as natural key
export type RoundResponse = {
  orderNumber: number; // Natural key (instead of 'id')
  name: string;
  createdAt: string;
  updatedAt: string;
};
```

#### GoalResponse Type

**Location:** Line 132-138

```typescript
// CURRENT (❌ WRONG)
export type GoalResponse = {
  id: string; // ← Should be 'number' (autoincrement)
  matchId: string; // ← Should be 'number' (autoincrement)
  playerId: string; // ← Should be 'number' (autoincrement)
  teamId: string; // ← Should be 'teamName'
  createdAt: string;
};

// SHOULD BE (✅ CORRECT)
export type GoalResponse = {
  id: number; // Changed from 'string'
  matchId: number; // Changed from 'string'
  playerId: number; // Changed from 'string'
  teamName: string; // Changed from 'teamId'
  createdAt: string;
};
```

#### MatchResponse Type

**Location:** Line 140-155

```typescript
// CURRENT (❌ WRONG)
export type MatchResponse = {
  id: string; // ← Should be 'number' (autoincrement)
  roundId: string; // ← Keep or change to orderNumber?
  roundOrderNumber: number;
  roundName: string;
  homeTeamId: string | null; // ← Should be 'homeTeamName'
  awayTeamId: string | null; // ← Should be 'awayTeamName'
  refereeId: string | null; // ← Should be 'refereeUsername'
  refereeName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
};

// SHOULD BE (✅ CORRECT)
export type MatchResponse = {
  id: number; // Changed from 'string'
  roundOrderNumber: number; // Natural key for round
  roundName: string;
  homeTeamName: string | null; // Changed from 'homeTeamId'
  awayTeamName: string | null; // Changed from 'awayTeamId'
  refereeUsername: string | null; // Changed from 'refereeId'
  refereeName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
};
```

#### StandingRow Type

**Location:** Line 157-167

```typescript
// CURRENT (❌ WRONG)
export type StandingRow = {
  teamId: string; // ← Should be 'teamName'
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

// SHOULD BE (✅ CORRECT)
export type StandingRow = {
  teamName: string; // Natural key (removed separate teamId)
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};
```

#### TopScorerRow Type

**Location:** Line 169-176

```typescript
// CURRENT (❌ WRONG)
export type TopScorerRow = {
  playerId: string; // ← Should be 'number' (autoincrement)
  playerName: string;
  teamId: string; // ← Should be 'teamName'
  teamName: string;
  teamCountryFlag: string;
  goals: number;
};

// SHOULD BE (✅ CORRECT)
export type TopScorerRow = {
  playerId: number; // Changed from 'string'
  playerName: string;
  teamName: string; // Changed from 'teamId' (removed duplicate)
  teamCountryFlag: string;
  goals: number;
};
```

---

## 2. back-end/service/authService.ts

### Issue 1: toPublicUser Function

**Location:** Line 7-14

```typescript
// CURRENT (❌ WRONG)
function toPublicUser(user: User): AuthUser {
  return {
    id: user.id, // ← User model doesn't have 'id'
    username: user.username,
    role: user.role,
    teamId: user.teamId, // ← User model has 'teamName' not 'teamId'
  };
}

// SHOULD BE (✅ CORRECT)
function toPublicUser(user: User): AuthUser {
  return {
    username: user.username,
    role: user.role,
    teamName: user.teamName, // Changed from 'teamId'
  };
}
```

### Issue 2: toAuthResponse Function JWT Token

**Location:** Line 16-25

```typescript
// CURRENT (❌ WRONG)
function toAuthResponse(user: User) {
  const token = signAccessToken({
    sub: user.id, // ← Should be user.username
    username: user.username,
    role: user.role,
    teamId: user.teamId, // ← Should be teamName
  });

  return { user: toPublicUser(user), token };
}

// SHOULD BE (✅ CORRECT)
function toAuthResponse(user: User) {
  const token = signAccessToken({
    sub: user.username, // Changed from 'user.id'
    username: user.username,
    role: user.role,
    teamName: user.teamName, // Changed from 'teamId'
  });

  return { user: toPublicUser(user), token };
}
```

### Issue 3: getCurrentUser Function

**Location:** Line 93-98

```typescript
// CURRENT (❌ WRONG)
export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  // ↑ Parameter 'userId' is misleading, should be 'username'
  // ↑ Query uses 'id' but schema uses 'username' as @id

  if (!user) {
    throw new NotFoundError("User was not found.");
  }

  return toPublicUser(User.from(user));
}

// SHOULD BE (✅ CORRECT)
export async function getCurrentUser(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    throw new NotFoundError("User was not found.");
  }

  return toPublicUser(User.from(user));
}
```

**Call Site Issue in authController.ts:**

```typescript
// Line 21 in authController.ts (❌ WRONG)
const currentUser = await getCurrentUser(user.id); // ← user doesn't have 'id' anymore

// SHOULD BE (✅ CORRECT)
const currentUser = await getCurrentUser(user.username);
```

---

## 3. back-end/service/userService.ts

### Issue 1: toPublicUser Function

**Location:** Line 6-13

```typescript
// Same as authService.ts - needs same fix
// CURRENT (❌ WRONG)
function toPublicUser(user: User): AuthUser {
  return {
    id: user.id, // ← User model doesn't have 'id'
    username: user.username,
    role: user.role,
    teamId: user.teamId, // ← Should be 'teamName'
  };
}

// SHOULD BE (✅ CORRECT)
function toPublicUser(user: User): AuthUser {
  return {
    username: user.username,
    role: user.role,
    teamName: user.teamName, // Changed from 'teamId'
  };
}
```

### Issue 2: deleteUserForAdmin Function

**Location:** Line 16-25

```typescript
// CURRENT (❌ WRONG)
export async function deleteUserForAdmin(userId: string, actorId: string) {
  if (userId === actorId) {
    // ← Both should be usernames
    throw new ValidationError("You cannot delete your own account.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  // ↑ Uses 'id' but schema now uses 'username' as @id

  if (!user) {
    throw new NotFoundError("User was not found.");
  }

  await prisma.user.delete({ where: { id: userId } });
  // ↑ Again, uses 'id'
}

// SHOULD BE (✅ CORRECT)
export async function deleteUserForAdmin(
  username: string,
  actorUsername: string,
) {
  if (username === actorUsername) {
    throw new ValidationError("You cannot delete your own account.");
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    throw new NotFoundError("User was not found.");
  }

  await prisma.user.delete({ where: { username } });
}
```

**Call Site Issue in userController.ts:**

```typescript
// Line 18 (❌ WRONG)
await deleteUserForAdmin(req.params.userId, actor.id);
// ↑ Both parameters should be usernames, not IDs

// SHOULD BE (✅ CORRECT)
await deleteUserForAdmin(req.params.username, actor.username);
```

---

## 4. back-end/util/middleware.ts

### Issue 1: RequestUser Type

**Location:** Line 8-12

```typescript
// CURRENT (❌ WRONG)
export type RequestUser = {
  id: string; // ← Should be removed or changed to username as identifier
  username: string;
  role: string;
  teamId: string | null; // ← Should be 'teamName'
};

// SHOULD BE (✅ CORRECT)
export type RequestUser = {
  username: string; // Primary identifier (username is @id)
  role: string;
  teamName: string | null; // Changed from 'teamId'
};
```

### Issue 2: authenticateToken Function

**Location:** Line 31-46

```typescript
// CURRENT (❌ WRONG)
export function authenticateToken(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(
      new UnauthorizedError(
        "You must send a Bearer token to access this route.",
      ),
    );
    return;
  }

  const token = header.slice("Bearer ".length);
  const payload = verifyAccessToken(token);

  (req as Request & { user?: RequestUser }).user = {
    id: payload.sub, // ← Should be removed
    username: payload.username,
    role: payload.role,
    teamId: payload.teamId, // ← Should be 'teamName'
  };

  next();
}

// SHOULD BE (✅ CORRECT)
export function authenticateToken(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(
      new UnauthorizedError(
        "You must send a Bearer token to access this route.",
      ),
    );
    return;
  }

  const token = header.slice("Bearer ".length);
  const payload = verifyAccessToken(token);

  (req as Request & { user?: RequestUser }).user = {
    username: payload.username,
    role: payload.role,
    teamName: payload.teamName, // Changed from 'teamId'
  };

  next();
}
```

---

## 5. back-end/util/jwt.ts

### Issue: JwtPayload Type

**Location:** Line 4-8

```typescript
// CURRENT (❌ WRONG)
export type JwtPayload = {
  sub: string; // ← This should be the username (natural key)
  username: string;
  role: string;
  teamId: string | null; // ← Should be 'teamName'
};

// SHOULD BE (✅ CORRECT)
export type JwtPayload = {
  sub: string; // username (natural key, keeping sub for JWT standard)
  username: string;
  role: string;
  teamName: string | null; // Changed from 'teamId'
};
```

---

## 6. back-end/service/matchService.ts

### Issue 1: assertMatchAccess Function

**Location:** Line 10-19

```typescript
// CURRENT (❌ WRONG)
function assertMatchAccess(actor: RequestUser, refereeId: string | null): void {
  if (actor.role === "ADMIN") {
    return;
  }

  if (actor.role === "REFEREE" && actor.id === refereeId) {
    // ↑ actor doesn't have 'id' anymore, it has 'username'
    return;
  }

  throw new ForbiddenError(
    "Only the assigned referee or admin can update this match.",
  );
}

// SHOULD BE (✅ CORRECT)
function assertMatchAccess(
  actor: RequestUser,
  refereeUsername: string | null,
): void {
  if (actor.role === "ADMIN") {
    return;
  }

  if (actor.role === "REFEREE" && actor.username === refereeUsername) {
    return;
  }

  throw new ForbiddenError(
    "Only the assigned referee or admin can update this match.",
  );
}
```

### Issue 2: loadMatch Function

**Location:** Line 21-27

```typescript
// CURRENT (❌ WRONG)
async function loadMatch(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  // ↑ 'id' parameter works (matchId is Int), but be consistent with type

  if (!match) {
    throw new NotFoundError("Match was not found.");
  }

  return match;
}

// SHOULD BE (✅ CORRECT)
async function loadMatch(matchId: number) {
  // Change to number
  const match = await prisma.match.findUnique({ where: { id: matchId } });

  if (!match) {
    throw new NotFoundError("Match was not found.");
  }

  return match;
}
```

### Issue 3: validateGoalInput Function - Line 67-90

```typescript
// CURRENT (❌ WRONG)
async function validateGoalInput(matchId: string, goal: GoalInputDto) {
  const match = await loadMatch(matchId);

  if (!match.homeTeamId || !match.awayTeamId) {
    throw new ValidationError(
      "This match is not available yet. Teams are not assigned yet.",
    );
  }

  const player = await prisma.player.findUnique({
    where: { id: goal.playerId },
  });
  // ↑ goal.playerId is now a number, schema expects number - OK

  if (!player) {
    throw new NotFoundError("Scoring player was not found.");
  }

  if (player.teamId !== goal.teamId) {
    // ↑ Both should be teamName (string), not numeric IDs
    throw new ValidationError("Goal team must match the selected player team.");
  }

  if (goal.teamId !== match.homeTeamId && goal.teamId !== match.awayTeamId) {
    // ↑ Comparing teamId (should be teamName)
    throw new ValidationError(
      "Goal team must be one of the teams in the match.",
    );
  }
}

// SHOULD BE (✅ CORRECT)
async function validateGoalInput(matchId: number, goal: GoalInputDto) {
  const match = await loadMatch(matchId);

  if (!match.homeTeamName || !match.awayTeamName) {
    throw new ValidationError(
      "This match is not available yet. Teams are not assigned yet.",
    );
  }

  const player = await prisma.player.findUnique({
    where: { id: goal.playerId },
  });

  if (!player) {
    throw new NotFoundError("Scoring player was not found.");
  }

  if (player.teamName !== goal.teamName) {
    throw new ValidationError("Goal team must match the selected player team.");
  }

  if (
    goal.teamName !== match.homeTeamName &&
    goal.teamName !== match.awayTeamName
  ) {
    throw new ValidationError(
      "Goal team must be one of the teams in the match.",
    );
  }
}
```

### Issue 4: recalculateMatchScores Function - Line 92-106

```typescript
// CURRENT (❌ WRONG)
async function recalculateMatchScores(matchId: string) {
  const match = await loadMatch(matchId);
  const goals = await prisma.goal.findMany({ where: { matchId } });

  const homeScore = goals.filter(
    (goal) => goal.teamId === match.homeTeamId,
  ).length;
  // ↑ Comparing teamId with homeTeamId (types don't match now)
  const awayScore = goals.filter(
    (goal) => goal.teamId === match.awayTeamId,
  ).length;
  // ↑ Same issue

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore },
  });
}

// SHOULD BE (✅ CORRECT)
async function recalculateMatchScores(matchId: number) {
  const match = await loadMatch(matchId);
  const goals = await prisma.goal.findMany({ where: { matchId } });

  const homeScore = goals.filter(
    (goal) => goal.teamName === match.homeTeamName,
  ).length;
  const awayScore = goals.filter(
    (goal) => goal.teamName === match.awayTeamName,
  ).length;

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore },
  });
}
```

### Issue 5: listMatches, getMatch Functions - Line 109-152

```typescript
// getMatch function - all these selects use old field names:
const match = await prisma.match.findUnique({
  where: { id: matchId }, // ← matchId should be number
  include: {
    goals: {
      include: {
        player: {
          select: {
            id: true, // ← OK (numeric)
            firstName: true,
            lastName: true,
          },
        },
        team: {
          select: {
            id: true, // ← Should be 'name' (now the @id)
            countryFlag: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    },
  },
});
```

**In the return object of getMatch:**

```typescript
// CURRENT (❌ WRONG)
goals: match.goals.map((goal) => ({
  id: goal.id,
  playerId: goal.playerId, // ← Already number, OK
  teamId: goal.teamId, // ← Should be 'teamName'
  playerName: `${goal.player.firstName} ${goal.player.lastName}`,
  teamName: goal.team.name,
  teamCountryFlag: goal.team.countryFlag,
  createdAt: goal.createdAt,
}));

// SHOULD BE (✅ CORRECT)
goals: match.goals.map((goal) => ({
  id: goal.id,
  playerId: goal.playerId,
  teamName: goal.teamName, // Changed
  playerName: `${goal.player.firstName} ${goal.player.lastName}`,
  teamCountryFlag: goal.team.countryFlag,
  createdAt: goal.createdAt,
}));
```

### Issue 6: updateMatchStatus Function - Line 154-200

```typescript
// CURRENT (❌ WRONG)
export async function updateMatchStatus(
  matchId: string,
  status: MatchStatus,
  actor: RequestUser,
) {
  // ↑ matchId should be number
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeId);
  // ↑ Field name is now 'refereeUsername' not 'refereeId'

  // ...
  if (status === "FINISHED") {
    await createNextRoundMatchesIfReady(String(updated.roundOrderNumber));
    // ↑ roundOrderNumber is already number, don't stringify
  }
}

// SHOULD BE (✅ CORRECT)
export async function updateMatchStatus(
  matchId: number,
  status: MatchStatus,
  actor: RequestUser,
) {
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeUsername);

  // ...
  if (status === "FINISHED") {
    await createNextRoundMatchesIfReady(updated.roundOrderNumber);
  }
}
```

### Issue 7: updateMatchResult Function - Line 202-274

```typescript
// Multiple issues with parameter types and field names
// CURRENT (❌ WRONG)
export async function updateMatchResult(
  matchId: string,
  input: MatchResultDto,
  actor: RequestUser,
) {
  // ↑ matchId should be number
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeId);
  // ↑ Should be 'refereeUsername'

  if (!match.homeTeamId || !match.awayTeamId) {
    // ↑ Should be 'homeTeamName' / 'awayTeamName'
    throw new ValidationError(
      "This match is not available yet. Teams are not assigned yet.",
    );
  }

  if (input.goals && input.goals.length > 0) {
    await prisma.goal.deleteMany({ where: { matchId } });

    for (const goal of input.goals) {
      await validateGoalInput(matchId, goal);

      await prisma.goal.create({
        data: {
          matchId,
          playerId: goal.playerId, // ← Already number, OK
          teamId: goal.teamId, // ← Should be 'teamName'
        },
      });
    }

    await recalculateMatchScores(matchId);
  }

  // ... rest of function

  await createNextRoundMatchesIfReady(String(updated.roundOrderNumber));
  // ↑ Don't stringify
}

// SHOULD BE (✅ CORRECT)
export async function updateMatchResult(
  matchId: number,
  input: MatchResultDto,
  actor: RequestUser,
) {
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeUsername);

  if (!match.homeTeamName || !match.awayTeamName) {
    throw new ValidationError(
      "This match is not available yet. Teams are not assigned yet.",
    );
  }

  if (input.goals && input.goals.length > 0) {
    await prisma.goal.deleteMany({ where: { matchId } });

    for (const goal of input.goals) {
      await validateGoalInput(matchId, goal);

      await prisma.goal.create({
        data: {
          matchId,
          playerId: goal.playerId,
          teamName: goal.teamName, // Changed
        },
      });
    }

    await recalculateMatchScores(matchId);
  }

  // ... rest of function

  await createNextRoundMatchesIfReady(updated.roundOrderNumber);
}
```

### Issue 8: addGoal Function - Line 276-300

```typescript
// CURRENT (❌ WRONG)
export async function addGoal(
  matchId: string,
  input: GoalInputDto,
  actor: RequestUser,
) {
  // ↑ matchId should be number
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeId);
  // ↑ Should be 'refereeUsername'

  if (!match.homeTeamId || !match.awayTeamId) {
    // ↑ Should use teamName
    throw new ValidationError(
      "This match is not available yet. Teams are not assigned yet.",
    );
  }

  // ...

  const goal = await prisma.goal.create({
    data: {
      matchId,
      playerId: input.playerId,
      teamId: input.teamId, // ↑ Should be 'teamName'
    },
  });

  await recalculateMatchScores(matchId);

  return Goal.from(goal);
}

// SHOULD BE (✅ CORRECT)
export async function addGoal(
  matchId: number,
  input: GoalInputDto,
  actor: RequestUser,
) {
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeUsername);

  if (!match.homeTeamName || !match.awayTeamName) {
    throw new ValidationError(
      "This match is not available yet. Teams are not assigned yet.",
    );
  }

  // ...

  const goal = await prisma.goal.create({
    data: {
      matchId,
      playerId: input.playerId,
      teamName: input.teamName, // Changed
    },
  });

  await recalculateMatchScores(matchId);

  return Goal.from(goal);
}
```

### Issue 9: updateGoal Function - Line 302-331

```typescript
// Similar pattern - parameter types and field names
// CURRENT (❌ WRONG)
export async function updateGoal(
  matchId: string,
  goalId: string,
  input: GoalInputDto,
  actor: RequestUser,
) {
  // ↑ Both IDs should be numbers
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeId);
  // ↑ Should be refereeUsername

  if (!match.homeTeamId || !match.awayTeamId) {
    // ↑ Should use teamName
    throw new ValidationError(
      "This match is not available yet. Teams are not assigned yet.",
    );
  }

  const goal = await prisma.goal.findFirst({ where: { id: goalId, matchId } });
  // ↑ Both are now numeric, so this is OK

  if (!goal) {
    throw new NotFoundError("Goal was not found.");
  }

  await validateGoalInput(matchId, input);

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: input, // ↑ input has wrong field names
  });

  await recalculateMatchScores(matchId);

  return Goal.from(updated);
}

// SHOULD BE (✅ CORRECT)
export async function updateGoal(
  matchId: number,
  goalId: number,
  input: GoalInputDto,
  actor: RequestUser,
) {
  const match = await loadMatch(matchId);
  assertMatchAccess(actor, match.refereeUsername);

  if (!match.homeTeamName || !match.awayTeamName) {
    throw new ValidationError(
      "This match is not available yet. Teams are not assigned yet.",
    );
  }

  const goal = await prisma.goal.findFirst({ where: { id: goalId, matchId } });

  if (!goal) {
    throw new NotFoundError("Goal was not found.");
  }

  await validateGoalInput(matchId, input);

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: input,
  });

  await recalculateMatchScores(matchId);

  return Goal.from(updated);
}
```

### Issue 10: getTopScorers Function - Line 333-368

```typescript
// CURRENT (❌ WRONG)
export async function getTopScorers() {
  const goals = await prisma.goal.findMany({ orderBy: { createdAt: "asc" } });
  const players = await prisma.player.findMany();
  const teams = await prisma.team.findMany();

  const playerById = new Map(players.map((player) => [player.id, player]));
  // ↑ player.id is now number - OK
  const teamById = new Map(teams.map((team) => [team.id, team]));
  // ↑ team.id is now 'name' (the @id), not 'id' field!

  const scorerMap = new Map<
    string,
    {
      playerId: string; // ↑ Should be number
      playerName: string;
      teamId: string; // ↑ Should be teamName
      teamName: string;
      teamCountryFlag: string;
      goals: number;
    }
  >();

  for (const goal of goals) {
    const player = playerById.get(goal.playerId); // ← OK
    const team = teamById.get(goal.teamId); // ← goal.teamId is now teamName
    // ↑ Mismatch!

    if (!player || !team) {
      continue;
    }

    const existing = scorerMap.get(player.id) ?? {
      playerId: player.id, // ← OK
      playerName: `${player.firstName} ${player.lastName}`,
      teamId: team.id, // ← Should be team.name
      teamName: team.name,
      teamCountryFlag: team.countryFlag,
      goals: 0,
    };

    existing.goals += 1;
    scorerMap.set(player.id, existing);
  }

  return Array.from(scorerMap.values()).sort(
    (left, right) => right.goals - left.goals,
  );
}

// SHOULD BE (✅ CORRECT)
export async function getTopScorers() {
  const goals = await prisma.goal.findMany({ orderBy: { createdAt: "asc" } });
  const players = await prisma.player.findMany();
  const teams = await prisma.team.findMany();

  const playerById = new Map(players.map((player) => [player.id, player]));
  const teamByName = new Map(teams.map((team) => [team.name, team]));

  const scorerMap = new Map<
    number,
    {
      playerId: number; // Changed
      playerName: string;
      teamName: string; // Changed
      teamCountryFlag: string;
      goals: number;
    }
  >();

  for (const goal of goals) {
    const player = playerById.get(goal.playerId);
    const team = teamByName.get(goal.teamName); // Changed

    if (!player || !team) {
      continue;
    }

    const existing = scorerMap.get(player.id) ?? {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      teamName: team.name, // Changed
      teamCountryFlag: team.countryFlag,
      goals: 0,
    };

    existing.goals += 1;
    scorerMap.set(player.id, existing);
  }

  return Array.from(scorerMap.values()).sort(
    (left, right) => right.goals - left.goals,
  );
}
```

---

## 7. back-end/service/playerService.ts

### Issue 1: Function Parameter Types

**Location:** Line 6-15

```typescript
// CURRENT (❌ WRONG)
export async function listPlayers(teamId?: string) {
  // ↑ Should be 'teamName' not 'teamId'
  const players = await prisma.player.findMany({
    where: teamId ? { teamId } : undefined,
    // ↑ Should be { teamName }
    orderBy: [{ teamId: "asc" }, { shirtNumber: "asc" }],
    // ↑ Orderby teamId should be teamName
  });

  return players.map((player) => Player.from(player));
}

export async function getPlayer(playerId: string) {
  // ↑ Should be 'number' not 'string'
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  // ↑ OK, just type is wrong

  if (!player) {
    throw new NotFoundError("Player was not found.");
  }

  return Player.from(player);
}

// SHOULD BE (✅ CORRECT)
export async function listPlayers(teamName?: string) {
  const players = await prisma.player.findMany({
    where: teamName ? { teamName } : undefined,
    orderBy: [{ teamName: "asc" }, { shirtNumber: "asc" }],
  });

  return players.map((player) => Player.from(player));
}

export async function getPlayer(playerId: number) {
  const player = await prisma.player.findUnique({ where: { id: playerId } });

  if (!player) {
    throw new NotFoundError("Player was not found.");
  }

  return Player.from(player);
}
```

### Issue 2: createPlayer Function

**Location:** Line 17-45

```typescript
// CURRENT (❌ WRONG)
export async function createPlayer(input: PlayerCreateDto) {
  const team = await prisma.team.findUnique({ where: { id: input.teamId } });
  // ↑ Should use 'name' not 'id', and input.teamName not input.teamId

  if (!team) {
    throw new NotFoundError("Team was not found.");
  }

  const existingPlayer = await prisma.player.findUnique({
    where: {
      teamId_shirtNumber: {
        teamId: input.teamId, // ↑ Should be teamName
        shirtNumber: input.shirtNumber,
      },
    },
  });

  if (existingPlayer) {
    throw new ValidationError("Shirt number is already used in this team.");
  }

  const player = await prisma.player.create({
    data: {
      teamId: input.teamId, // ↑ Should be teamName
      firstName: input.firstName,
      lastName: input.lastName,
      shirtNumber: input.shirtNumber,
      position: input.position,
    },
  });

  return Player.from(player);
}

// SHOULD BE (✅ CORRECT)
export async function createPlayer(input: PlayerCreateDto) {
  const team = await prisma.team.findUnique({
    where: { name: input.teamName },
  });

  if (!team) {
    throw new NotFoundError("Team was not found.");
  }

  const existingPlayer = await prisma.player.findUnique({
    where: {
      teamName_shirtNumber: {
        teamName: input.teamName,
        shirtNumber: input.shirtNumber,
      },
    },
  });

  if (existingPlayer) {
    throw new ValidationError("Shirt number is already used in this team.");
  }

  const player = await prisma.player.create({
    data: {
      teamName: input.teamName,
      firstName: input.firstName,
      lastName: input.lastName,
      shirtNumber: input.shirtNumber,
      position: input.position,
    },
  });

  return Player.from(player);
}
```

### Issue 3: updatePlayer Function

**Location:** Line 47-62

```typescript
// CURRENT (❌ WRONG)
export async function updatePlayer(playerId: string, input: PlayerUpdateDto) {
  // ↑ playerId should be number
  const existingPlayer = await getPlayer(playerId);

  const player = await prisma.player.update({
    where: { id: playerId },
    data: {
      firstName: input.firstName ?? existingPlayer.firstName,
      lastName: input.lastName ?? existingPlayer.lastName,
      shirtNumber: input.shirtNumber ?? existingPlayer.shirtNumber,
      position: input.position ?? existingPlayer.position,
    },
  });

  return Player.from(player);
}

// SHOULD BE (✅ CORRECT)
export async function updatePlayer(playerId: number, input: PlayerUpdateDto) {
  const existingPlayer = await getPlayer(playerId);

  const player = await prisma.player.update({
    where: { id: playerId },
    data: {
      firstName: input.firstName ?? existingPlayer.firstName,
      lastName: input.lastName ?? existingPlayer.lastName,
      shirtNumber: input.shirtNumber ?? existingPlayer.shirtNumber,
      position: input.position ?? existingPlayer.position,
    },
  });

  return Player.from(player);
}
```

### Issue 4: deletePlayer Function

**Location:** Line 64-67

```typescript
// CURRENT (❌ WRONG)
export async function deletePlayer(playerId: string) {
  // ↑ Should be number
  await getPlayer(playerId);
  await prisma.player.delete({ where: { id: playerId } });
}

// SHOULD BE (✅ CORRECT)
export async function deletePlayer(playerId: number) {
  await getPlayer(playerId);
  await prisma.player.delete({ where: { id: playerId } });
}
```

---

## 8. back-end/controller/playerController.ts

### Issue: Query Parameter Type

**Location:** Line 7-11

```typescript
// CURRENT (❌ WRONG)
playerRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const teamId =
      typeof req.query.teamId === "string" ? req.query.teamId : undefined;
    // ↑ Should be looking for 'teamName' query parameter
    const players = await listPlayers(teamId);
    res.json(players);
  }),
);

// SHOULD BE (✅ CORRECT)
playerRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const teamName =
      typeof req.query.teamName === "string" ? req.query.teamName : undefined;
    const players = await listPlayers(teamName);
    res.json(players);
  }),
);
```

### Issue: Route Parameter Type

**Location:** Line 13-16

```typescript
// CURRENT (❌ WRONG)
playerRouter.get(
  "/:playerId",
  asyncHandler(async (req, res) => {
    const player = await getPlayer(req.params.playerId);
    // ↑ Need to parse to number
    res.json(player);
  }),
);

// SHOULD BE (✅ CORRECT)
playerRouter.get(
  "/:playerId",
  asyncHandler(async (req, res) => {
    const player = await getPlayer(Number(req.params.playerId));
    res.json(player);
  }),
);
```

---

## 9. back-end/controller/userController.ts

### Issue: Delete User Route

**Location:** Line 18

```typescript
// CURRENT (❌ WRONG)
userRouter.delete(
  "/:userId",
  authenticateToken,
  requireRoles("ADMIN"),
  asyncHandler(async (req, res) => {
    const actor = getAuthenticatedUser(req);
    await deleteUserForAdmin(req.params.userId, actor.id);
    // ↑ Wrong parameter names and field access
    res.status(204).send();
  }),
);

// SHOULD BE (✅ CORRECT)
userRouter.delete(
  "/:username",
  authenticateToken,
  requireRoles("ADMIN"),
  asyncHandler(async (req, res) => {
    const actor = getAuthenticatedUser(req);
    await deleteUserForAdmin(req.params.username, actor.username);
    res.status(204).send();
  }),
);
```

---

## 10. back-end/controller/authController.ts

### Issue: Me Route

**Location:** Line 21

```typescript
// CURRENT (❌ WRONG)
authRouter.get(
  "/me",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req);
    const currentUser = await getCurrentUser(user.id); // ← user doesn't have 'id'
    res.json(currentUser);
  }),
);

// SHOULD BE (✅ CORRECT)
authRouter.get(
  "/me",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req);
    const currentUser = await getCurrentUser(user.username);
    res.json(currentUser);
  }),
);
```

---

## 11. back-end/service/tournamentService.ts

### Issue 1: roundIdFromOrder Function

**Location:** Line 12-14

```typescript
// This function is OK as-is, but usage may need adjustment
function roundIdFromOrder(orderNumber: number): string {
  return String(orderNumber); // Returns string representation
}
```

### Issue 2: createStandingRow Function

**Location:** Line 46-57

```typescript
// CURRENT (❌ WRONG)
function createStandingRow(team: Team): StandingRow {
  return {
    teamId: team.id, // ← team.id is now 'name' (the @id)
    teamName: team.name,
    // ... rest
  };
}

// SHOULD BE (✅ CORRECT)
function createStandingRow(team: Team): StandingRow {
  return {
    teamName: team.name, // Changed to use name as identifier
    // ... rest
  };
}
```

### Issue 3: calculateStandings Function

**Location:** Line 59-112

```typescript
// CURRENT (❌ WRONG)
function calculateStandings(matches: Match[], teams: Team[]): StandingRow[] {
  const rows = new Map<string, StandingRow>(
    teams.map((team) => [team.id, createStandingRow(team)]),
    // ↑ team.id is now 'name', not a separate id field
  );

  for (const match of matches) {
    // ...
    const homeRow = rows.get(match.homeTeamId);
    // ↑ match.homeTeamId is now match.homeTeamName
    const awayRow = rows.get(match.awayTeamId);
    // ↑ match.awayTeamId is now match.awayTeamName
  }
  // ...
}

// SHOULD BE (✅ CORRECT)
function calculateStandings(matches: Match[], teams: Team[]): StandingRow[] {
  const rows = new Map<string, StandingRow>(
    teams.map((team) => [team.name, createStandingRow(team)]),
  );

  for (const match of matches) {
    // ...
    const homeRow = rows.get(match.homeTeamName);
    const awayRow = rows.get(match.awayTeamName);
  }
  // ...
}
```

### Issue 4: calculateTopScorers Function

**Location:** Line 114-144

```typescript
// CURRENT (❌ WRONG)
function calculateTopScorers(
  goals: Goal[],
  players: Player[],
  teams: Team[],
): TopScorerRow[] {
  const playerById = new Map(players.map((player) => [player.id, player]));
  // ↑ OK - player.id is numeric
  const teamById = new Map(teams.map((team) => [team.id, team]));
  // ↑ WRONG - team.id is now 'name'

  const scorerMap = new Map<string, TopScorerRow>();

  for (const goal of goals) {
    const player = playerById.get(goal.playerId); // ← OK
    const team = teamById.get(goal.teamId); // ← WRONG - goal.teamId is now teamName
    // ↑ Mismatch!

    if (!player || !team) {
      continue;
    }

    const current = scorerMap.get(player.id) ?? {
      playerId: player.id, // ← OK
      playerName: `${player.firstName} ${player.lastName}`,
      teamId: team.id, // ← WRONG - should be team.name
      teamName: team.name,
      teamCountryFlag: team.countryFlag,
      goals: 0,
    };

    current.goals += 1;
    scorerMap.set(player.id, current);
  }

  return Array.from(scorerMap.values()).sort(
    (left, right) => right.goals - left.goals,
  );
}

// SHOULD BE (✅ CORRECT)
function calculateTopScorers(
  goals: Goal[],
  players: Player[],
  teams: Team[],
): TopScorerRow[] {
  const playerById = new Map(players.map((player) => [player.id, player]));
  const teamByName = new Map(teams.map((team) => [team.name, team]));

  const scorerMap = new Map<number, TopScorerRow>();

  for (const goal of goals) {
    const player = playerById.get(goal.playerId);
    const team = teamByName.get(goal.teamName); // Changed

    if (!player || !team) {
      continue;
    }

    const current = scorerMap.get(player.id) ?? {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      teamName: team.name, // Changed
      teamCountryFlag: team.countryFlag,
      goals: 0,
    };

    current.goals += 1;
    scorerMap.set(player.id, current);
  }

  return Array.from(scorerMap.values()).sort(
    (left, right) => right.goals - left.goals,
  );
}
```

### Issue 5: buildGoalsForMatch Function

**Location:** Line 181-217

```typescript
// CURRENT (❌ WRONG)
function buildGoalsForMatch(
  match: Match,
  playersByTeam: Map<string, Player[]>,
): GoalInputDto[] {
  if (!match.homeTeamId || !match.awayTeamId) {
    // ↑ Should be homeTeamName / awayTeamName
    throw new ValidationError(
      "Cannot simulate a match without both teams assigned.",
    );
  }

  const homeTeamId = match.homeTeamId as string;
  // ↑ Should be homeTeamName
  const awayTeamId = match.awayTeamId as string;
  // ↑ Should be awayTeamName

  // ...

  const goalTeams: string[] = shuffle([
    ...Array.from({ length: homeScore }, () => homeTeamId),
    ...Array.from({ length: awayScore }, () => awayTeamId),
  ]);

  return goalTeams.map((teamId) => {
    const teamPlayers = playersByTeam.get(teamId) ?? [];
    // ↑ teamId should be teamName

    if (teamPlayers.length === 0) {
      throw new ValidationError(
        "Unable to simulate a goal without players for one of the teams.",
      );
    }

    const scorer = teamPlayers[randomInt(0, teamPlayers.length - 1)];

    return {
      playerId: scorer.id,
      teamId, // ↑ Should be teamName
    };
  });
}

// SHOULD BE (✅ CORRECT)
function buildGoalsForMatch(
  match: Match,
  playersByTeam: Map<string, Player[]>,
): GoalInputDto[] {
  if (!match.homeTeamName || !match.awayTeamName) {
    throw new ValidationError(
      "Cannot simulate a match without both teams assigned.",
    );
  }

  const homeTeamName = match.homeTeamName as string;
  const awayTeamName = match.awayTeamName as string;

  // ...

  const goalTeams: string[] = shuffle([
    ...Array.from({ length: homeScore }, () => homeTeamName),
    ...Array.from({ length: awayScore }, () => awayTeamName),
  ]);

  return goalTeams.map((teamName) => {
    const teamPlayers = playersByTeam.get(teamName) ?? [];

    if (teamPlayers.length === 0) {
      throw new ValidationError(
        "Unable to simulate a goal without players for one of the teams.",
      );
    }

    const scorer = teamPlayers[randomInt(0, teamPlayers.length - 1)];

    return {
      playerId: scorer.id,
      teamName, // Changed
    };
  });
}
```

### Issue 6: getCompetitionOverview Function - Line 273-348

```typescript
// CURRENT (❌ WRONG)
const referees = prisma.user.findMany({
  where: { role: 'REFEREE' },
  select: { id: true, username: true }  // ← Should just be username
});

// ...

const teamById = new Map(teamModels.map((team) => [team.id, team]));
// ↑ team.id is now 'name'

const refereeById = new Map(referees.map((referee) => [referee.id, referee]));
// ↑ Should use referee.username as key

// In the return:
teams: teamModels.map((team) => ({
  id: team.id,  // ← team.id is now 'name', not a separate id
  name: team.name,
  // ...
})),

matches: matchModels.map((match) => ({
  id: match.id,              // ← OK - numeric
  roundId: match.roundId,    // ← Should be roundOrderNumber
  roundOrderNumber: match.roundOrderNumber,
  roundName: match.roundName,
  homeTeamId: match.homeTeamId,       // ↑ Should be homeTeamName
  awayTeamId: match.awayTeamId,       // ↑ Should be awayTeamName
  refereeId: match.refereeId,         // ↑ Should be refereeUsername
  refereeName: match.refereeId ? (refereeById.get(match.refereeId)?.username.replace(/_/g, ' ') ?? null) : null,
  // ↑ Wrong key access
  // ...
}))

// SHOULD BE (✅ CORRECT)
const referees = prisma.user.findMany({
  where: { role: 'REFEREE' },
  select: { username: true }
});

// ...

const teamByName = new Map(teamModels.map((team) => [team.name, team]));

const refereeByUsername = new Map(referees.map((referee) => [referee.username, referee]));

// In the return:
teams: teamModels.map((team) => ({
  name: team.name,
  country: team.country,
  countryShortName: team.countryShortName,
  countryFlag: team.countryFlag,
  createdAt: team.createdAt.toISOString(),
  updatedAt: team.updatedAt.toISOString(),
})),

matches: matchModels.map((match) => ({
  id: match.id,
  roundOrderNumber: match.roundOrderNumber,
  roundName: match.roundName,
  homeTeamName: match.homeTeamName,
  awayTeamName: match.awayTeamName,
  refereeUsername: match.refereeUsername,
  refereeName: match.refereeUsername ? (refereeByUsername.get(match.refereeUsername)?.username.replace(/_/g, ' ') ?? null) : null,
  // ... rest
}))
```

### Issue 7: simulateRound Function - Line 366-451

```typescript
// Multiple similar issues - all occurrences of:
// - match.homeTeamId → match.homeTeamName
// - match.awayTeamId → match.awayTeamName
// - match.refereeId → match.refereeUsername
// - teamsInRound should store teamNames not IDs
// - refereeId select → refereeUsername select
// - goalId mapping

// CURRENT (❌ PATTERNS TO FIX)
const teamsInRound = new Set<string>();
for (const match of activeRoundMatches) {
  if (!match.homeTeamId || !match.awayTeamId) {
    // ↑ Should be teamName
    throw new ValidationError(...);
  }
  teamsInRound.add(match.homeTeamId);
  teamsInRound.add(match.awayTeamId);
}

const players = await prisma.player.findMany({
  where: { teamId: { in: Array.from(teamsInRound) } },
  // ↑ Should be { teamName: { in: ... } }
  // ...
});

const playersByTeam = new Map<string, Player[]>();
for (const player of players.map((item) => Player.from(item))) {
  const existing = playersByTeam.get(player.teamId) ?? [];
  // ↑ Should be player.teamName
  // ...
}

// In transaction:
await transaction.goal.deleteMany({
  where: { matchId: { in: activeRoundMatches.map((match) => match.id) } }
});

for (const match of activeRoundMatches) {
  const goals = buildGoalsForMatch(Match.from(match), playersByTeam);
  const homeScore = goals.filter((goal) => goal.teamId === match.homeTeamId).length;
  // ↑ Should be goal.teamName === match.homeTeamName
  const awayScore = goals.filter((goal) => goal.teamId === match.awayTeamId).length;
  // ↑ Should be goal.teamName === match.awayTeamName

  // ...
}

// Select clause issue:
const [referees] = await Promise.all([
  prisma.user.findMany({
    where: { role: 'REFEREE' },
    select: { id: true, username: true }  // ↑ Should be just username
  }),
]);

const refereeNameById = new Map(
  referees.map((referee) => [referee.id, referee.username.replace(/_/g, ' ')])
  // ↑ Should use referee.username as key
);

// In return mapping:
refereeId: match.refereeId,  // ↑ Should be refereeUsername
refereeName: match.refereeId ? refereeNameById.get(match.refereeId) ?? null : null,
// ↑ Wrong key
```

---

## 12. back-end/service/roundProgressionService.ts

### Issue 1: parseRoundIdentifier Function

**Location:** Line 9-16

```typescript
// This is OK - no changes needed for round identifier
```

### Issue 2: createNextRoundMatchesIfReady Function

**Location:** Line 18-91

```typescript
// CURRENT (❌ WRONG)
const winners = completedRoundMatches.map((match) => {
  if (!match.homeTeamId || !match.awayTeamId) {
    // ↑ Should be teamName
    throw new ValidationError(
      "Completed knockout matches must have both teams assigned.",
    );
  }

  // ...

  return homeScore > awayScore ? match.homeTeamId : match.awayTeamId;
  // ↑ Should return teamName not teamId
});

// ...

const homeTeamId = winners[index * 2];
const awayTeamId = winners[index * 2 + 1];
// ↑ These are now teamNames, so rename for clarity

await transaction.goal.deleteMany({
  where: { matchId: nextRoundMatches[index].id },
});

await transaction.match.update({
  where: { id: nextRoundMatches[index].id },
  data: {
    homeTeamId, // ↑ Should be homeTeamName
    awayTeamId, // ↑ Should be awayTeamName
    homeScore: null,
    awayScore: null,
    status: "NOT_STARTED",
  },
});

// SHOULD BE (✅ CORRECT)
const winners = completedRoundMatches.map((match) => {
  if (!match.homeTeamName || !match.awayTeamName) {
    throw new ValidationError(
      "Completed knockout matches must have both teams assigned.",
    );
  }

  // ...

  return homeScore > awayScore ? match.homeTeamName : match.awayTeamName;
});

// ...

const homeTeamName = winners[index * 2];
const awayTeamName = winners[index * 2 + 1];

await transaction.goal.deleteMany({
  where: { matchId: nextRoundMatches[index].id },
});

await transaction.match.update({
  where: { id: nextRoundMatches[index].id },
  data: {
    homeTeamName,
    awayTeamName,
    homeScore: null,
    awayScore: null,
    status: "NOT_STARTED",
  },
});
```

---

## 13. back-end/util/seed.ts

### Issue 1: Seed Data Structure

**Location:** Line 121-149

```typescript
// CURRENT (❌ PATTERN)
const allMatches = [] as Array<{
  roundOrderNumber: number;
  roundName: string;
  homeTeamId: string | null; // ↑ Should be homeTeamName
  awayTeamId: string | null; // ↑ Should be awayTeamName
  refereeId: string | null; // ↑ Should be refereeUsername
  matchDate: Date;
  status: "PLANNED" | "NOT_STARTED" | "IN_PROGRESS";
  homeScore: null;
  awayScore: null;
}>;

for (const round of orderedRounds) {
  const roundMatchCount = fixedRoundMatchCounts[round.orderNumber - 1] ?? 0;

  for (let index = 0; index < roundMatchCount; index += 1) {
    const referee =
      refereeUsers[(index + round.orderNumber) % refereeUsers.length];
    const hasKnownTeams = round.orderNumber === 1;
    const homeTeam = hasKnownTeams ? teams[index * 2] : null;
    const awayTeam = hasKnownTeams ? teams[index * 2 + 1] : null;
    const matchDate = new Date(
      seedStartDate.getTime() + globalMatchIndex * 24 * 60 * 60 * 1000,
    );
    globalMatchIndex += 1;

    allMatches.push({
      roundOrderNumber: round.orderNumber,
      roundName: round.name,
      homeTeamId: homeTeam?.id ?? null, // ↑ Should be homeTeam?.name
      awayTeamId: awayTeam?.id ?? null, // ↑ Should be awayTeam?.name
      refereeId: referee?.id ?? null, // ↑ Should be referee?.username
      matchDate,
      status: round.orderNumber === 1 ? "IN_PROGRESS" : "PLANNED",
      homeScore: null,
      awayScore: null,
    });
  }
}

// SHOULD BE (✅ CORRECT)
const allMatches = [] as Array<{
  roundOrderNumber: number;
  roundName: string;
  homeTeamName: string | null;
  awayTeamName: string | null;
  refereeUsername: string | null;
  matchDate: Date;
  status: "PLANNED" | "NOT_STARTED" | "IN_PROGRESS";
  homeScore: null;
  awayScore: null;
}>;

for (const round of orderedRounds) {
  const roundMatchCount = fixedRoundMatchCounts[round.orderNumber - 1] ?? 0;

  for (let index = 0; index < roundMatchCount; index += 1) {
    const referee =
      refereeUsers[(index + round.orderNumber) % refereeUsers.length];
    const hasKnownTeams = round.orderNumber === 1;
    const homeTeam = hasKnownTeams ? teams[index * 2] : null;
    const awayTeam = hasKnownTeams ? teams[index * 2 + 1] : null;
    const matchDate = new Date(
      seedStartDate.getTime() + globalMatchIndex * 24 * 60 * 60 * 1000,
    );
    globalMatchIndex += 1;

    allMatches.push({
      roundOrderNumber: round.orderNumber,
      roundName: round.name,
      homeTeamName: homeTeam?.name ?? null,
      awayTeamName: awayTeam?.name ?? null,
      refereeUsername: referee?.username ?? null,
      matchDate,
      status: round.orderNumber === 1 ? "IN_PROGRESS" : "PLANNED",
      homeScore: null,
      awayScore: null,
    });
  }
}
```

### Issue 2: Player Creation

**Location:** Line 86-96

```typescript
// CURRENT (❌ WRONG)
for (const team of teams) {
  await prisma.player.createMany({
    data: Array.from({ length: seededPlayersPerTeam }, (_unused, index) => ({
      teamId: team.id, // ↑ Should be team.name
      firstName:
        playerFirstNames[(index + team.name.length) % playerFirstNames.length],
      lastName:
        playerLastNames[(index + team.country.length) % playerLastNames.length],
      shirtNumber: index + 1,
      position: positions[index % positions.length],
    })),
  });
}

// SHOULD BE (✅ CORRECT)
for (const team of teams) {
  await prisma.player.createMany({
    data: Array.from({ length: seededPlayersPerTeam }, (_unused, index) => ({
      teamName: team.name, // Changed from teamId
      firstName:
        playerFirstNames[(index + team.name.length) % playerFirstNames.length],
      lastName:
        playerLastNames[(index + team.country.length) % playerLastNames.length],
      shirtNumber: index + 1,
      position: positions[index % positions.length],
    })),
  });
}
```

---

## Migration Summary by Type

### Type Definition Changes (types/index.ts)

- [ ] AuthUser: remove `id`, change `teamId` → `teamName`
- [ ] PlayerCreateDto: change `teamId` → `teamName`
- [ ] MatchCreateDto: change `homeTeamId` → `homeTeamName`, `awayTeamId` → `awayTeamName`, `refereeId` → `refereeUsername`
- [ ] GoalInputDto: change `playerId` (string → number), `teamId` → `teamName`
- [ ] UserResponse: remove `id`, change `teamId` → `teamName`
- [ ] TeamResponse: remove `id` (use `name` as identifier)
- [ ] PlayerResponse: change `id` (string → number), `teamId` → `teamName`
- [ ] RoundResponse: reconsider `id` field (use `orderNumber` as natural key)
- [ ] GoalResponse: change `id`, `matchId`, `playerId` (string → number), `teamId` → `teamName`
- [ ] MatchResponse: change `id`, `homeTeamId` → `homeTeamName`, `awayTeamId` → `awayTeamName`, `refereeId` → `refereeUsername`
- [ ] StandingRow: change `teamId` → `teamName`
- [ ] TopScorerRow: change `playerId` (string → number), `teamId` → `teamName`

### Service Function Signature Changes

- [ ] authService.getCurrentUser: `userId` → `username`
- [ ] userService.deleteUserForAdmin: `userId` → `username`, `actorId` → `actorUsername`
- [ ] matchService: all functions with `matchId`, `goalId` (string → number)
- [ ] matchService: all references to refereeId → refereeUsername
- [ ] matchService: all references to teamId → teamName
- [ ] playerService: `playerId` (string → number), `teamId` → `teamName`
- [ ] tournamentService: similar field name updates

### Prisma Query Updates

- [ ] Replace all `where: { id: userId }` with `where: { username: userId }`
- [ ] Replace all `{ teamId: ... }` with `{ teamName: ... }`
- [ ] Replace all `{ refereeId: ... }` with `{ refereeUsername: ... }`
- [ ] Update orderBy clauses from `teamId` to `teamName`, `id` to appropriate fields
- [ ] Update select/include clauses for old field references

### URL Parameter Parsing

- [ ] Controller routes: change `:userId` → `:username`
- [ ] Controller routes: change `:playerId` parsing to `Number()`
- [ ] Controller routes: change query parameters from `teamId` → `teamName`

---

## Testing Checklist

After making changes, verify:

- [ ] All Prisma queries compile without type errors
- [ ] URL routes work with string usernames (case-insensitive where applicable)
- [ ] Numeric IDs for players, matches, goals are parsed correctly from URL params
- [ ] Join queries work with new field names (e.g., player.teamName matching match.homeTeamName)
- [ ] Seed data generates correctly with new schema
- [ ] JWT tokens contain `username` and `teamName` (not `id` and `teamId`)
- [ ] All API responses match new type definitions
- [ ] All controller-service-repository data flows are consistent
