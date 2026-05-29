# 03 — Database & Prisma

> **How data is stored, structured, and accessed.**

---

## What is a relational database?

A **relational database** stores data in _tables_ — like spreadsheets with columns (fields) and rows (records). Tables can _reference_ each other through **foreign keys**.

Example: a `Goal` row has a `matchId` column pointing to a row in the `Match` table. Every goal "belongs to" a match.

---

## The complete data model

```
User (1) ──── (many) Match (via refereeId — assigned referee)

Team (1) ──── (many) Match (via homeTeamId)
Team (1) ──── (many) Match (via awayTeamId)
Team (1) ──── (many) Player
Team (1) ──── (many) Goal

Match (1) ──── (many) Goal

Player (1) ──── (many) Goal
```

---

## The Prisma schema

File: `back-end/repository/prisma/schema.prisma`

This single file defines the entire database structure.

### Key Prisma syntax

| Syntax             | Meaning                                     |
| ------------------ | ------------------------------------------- |
| `@id`              | Primary key                                 |
| `@default(cuid())` | Auto-generates a unique string ID           |
| `@unique`          | No duplicate values allowed                 |
| `String?`          | `?` means optional (can be NULL)            |
| `@default(now())`  | Sets to current timestamp automatically     |
| `@updatedAt`       | Auto-updates timestamp on every change      |
| `@relation(...)`   | Defines a foreign key relationship          |
| `@@index([field])` | Creates a database index for faster queries |
| `@@unique([a, b])` | Combination of two fields must be unique    |

### Database enums

```prisma
enum MatchStatus {
  PLANNED      // match scheduled but teams may be TBD
  NOT_STARTED  // teams confirmed, waiting for kickoff
  IN_PROGRESS  // match being played
  FINISHED     // score entered
  COMPLETED    // bracket advanced
}

enum UserRole {
  ADMIN
  REFEREE
  USER
  GUEST
}

enum PlayerStatus {
  AVAILABLE
  UNAVAILABLE
}
```

---

## Prisma CRUD operations

```ts
// Create
const user = await prisma.user.create({
  data: { username, passwordHash, role: "USER" },
});

// Read one
const match = await prisma.match.findUnique({ where: { id: matchId } });

// Read many with filters
const matches = await prisma.match.findMany({
  where: { status: "FINISHED" },
  orderBy: { matchDate: "desc" },
});

// Update
await prisma.match.update({
  where: { id: matchId },
  data: { status: "IN_PROGRESS" },
});

// Delete
await prisma.user.delete({ where: { id: userId } });
```

---

## Relations & includes (JOINs)

```ts
// Include related data in one query
const match = await prisma.match.findUnique({
  where: { id: matchId },
  include: {
    goals: {
      include: {
        player: { select: { firstName: true, lastName: true } },
        team: { select: { name: true, countryFlag: true } },
      },
    },
  },
});
// match.goals is now an array with player and team data embedded
```

---

## Transactions

A **transaction** groups multiple operations — either all succeed or all fail together:

```ts
await prisma.$transaction(async (tx) => {
  await tx.goal.deleteMany({ where: { matchId: nextMatch.id } });
  await tx.match.update({
    where: { id: nextMatch.id },
    data: { homeTeamId: winner1, awayTeamId: winner2 },
  });
  // If anything throws, ALL changes are rolled back
});
```

---

## Tournament structure

| Round order | Name         | Matches | Teams          |
| ----------- | ------------ | ------- | -------------- |
| 1           | Round of 16  | 8       | 16 → 8 winners |
| 2           | Quarterfinal | 4       | 8 → 4 winners  |
| 3           | Semifinal    | 2       | 4 → 2 winners  |
| 4           | Final        | 1       | 2 → champion   |

When all matches in round N are `COMPLETED`, `roundProgressionService` automatically determines winners and fills in the next round's matches.
