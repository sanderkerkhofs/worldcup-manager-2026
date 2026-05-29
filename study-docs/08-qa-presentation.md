# 08 — Presentation Q&A Guide

> **Questions you are likely to be asked, with answers you can practice.**

**How to use this guide:** Read the question, try answering in your own words, then read the answer below. Practice saying answers out loud — you don't need to memorise them word-for-word.

---

## Project Overview

**Q: Explain your project in one sentence.**

"Worldcup Manager 2026 is a full-stack web application where an admin manages a knockout football tournament — scheduling matches, assigning referees, tracking goals — and the system automatically advances the bracket when a round is completed."

---

**Q: Who are the users and what can they do?**

- **Admin** — manage everything: users, matches, teams, simulate/reset rounds
- **Referee** — update only their assigned matches (status + goals)
- **User (fan)** — read-only: matches, standings, top scorers
- **Guest** — very limited read access without logging in

---

**Q: What is a knockout tournament?**

Each match has one winner. The loser is eliminated. This project has 4 rounds: Round of 16 → Quarterfinal → Semifinal → Final. Winners are automatically placed into the next round.

---

## Technology

**Q: What technology stack did you use?**

Back-end: Node.js + Express (API server), PostgreSQL (database), Prisma (ORM), TypeScript. Front-end: Next.js + React, SWR (data fetching), TypeScript. Infrastructure: Docker Compose.

---

**Q: What is TypeScript and why use it?**

TypeScript adds _static types_ to JavaScript. You declare what type each variable should be and the compiler catches type errors before the code runs. It makes code easier to read and maintain.

---

**Q: What is Prisma and what problem does it solve?**

Prisma is an ORM — it lets you write TypeScript instead of raw SQL. `prisma.user.findUnique({ where: { id } })` instead of `"SELECT * FROM users WHERE id = $1"`. It's type-safe, readable, and automatically generates SQL.

---

**Q: What is Docker and why did you use it?**

Docker packages the app and all its dependencies into containers that run identically on every machine. With Docker Compose, one command (`docker compose up`) starts the database, back-end, and front-end together. No manual setup required.

---

## Architecture

**Q: Explain the back-end layered architecture.**

Four layers: (1) **Controller** — handles HTTP requests, calls service; (2) **Service** — business logic and validation; (3) **Repository/Prisma** — database queries; (4) **Domain Model** — TypeScript classes with constructor validation. Each layer only talks to the layer below it.

---

**Q: What is a REST API?**

A convention for building web APIs around _resources_ (matches, players, users) using HTTP methods: GET to read, POST to create, PATCH to update, DELETE to remove. Data is exchanged as JSON.

---

## Authentication

**Q: How does the login process work?**

1. User sends username + password to `POST /api/auth/login`
2. Back-end finds user in database
3. `bcrypt.compare()` checks if entered password matches stored hash
4. If valid, server creates a JWT containing user ID, username, and role
5. Token is returned to front-end, stored in localStorage
6. Every subsequent request sends `Authorization: Bearer <token>`

---

**Q: Why are passwords not stored in plain text?**

If the database is breached, attackers would have everyone's passwords. bcrypt hashes them — a one-way transformation that cannot be reversed. bcrypt also adds a "salt" so identical passwords produce different hashes.

---

**Q: What is a JWT?**

JSON Web Token — three parts: header (algorithm), payload (data like user ID and role), signature (proof of integrity). The signature uses a secret key — any tampering with the payload invalidates the signature. This is stateless — no session stored in the database.

---

**Q: Difference between 401 and 403?**

- **401 Unauthorized** — "you are not logged in" — no valid token
- **403 Forbidden** — "you are logged in but don't have permission" — wrong role

---

## Business Logic

**Q: What are the match statuses?**

PLANNED → NOT_STARTED → IN_PROGRESS → FINISHED → COMPLETED. A referee can only move status forward, never backwards.

---

**Q: How does automatic bracket advancement work?**

When all matches in a round are FINISHED, `createNextRoundMatchesIfReady()` determines the winner of each match, assigns them as home/away teams in the next round, and marks the current round as COMPLETED — all inside a database transaction.

---

**Q: Why can't a match end in a draw?**

It's a knockout tournament — every match must produce one winner to advance the bracket. A draw would make it impossible to determine who goes through.

---

**Q: How is the standings table calculated?**

The `calculateStandings` service function loops over all finished matches, awards 3 pts (win), 1 pt (draw), 0 pts (loss), and tracks goal difference. Teams are sorted by: points → goal difference → goals scored → alphabetical.

---

## Testing

**Q: What tests did you write?**

Unit tests in `back-end/test/domain.test.ts` for the domain model classes: Team, Player, Match. They verify validation rules — e.g., creating a Team with an empty name throws a `ValidationError`, creating a Match where home and away team are the same throws an error.

---

**Q: Difference between unit and integration tests?**

Unit tests test one small piece in isolation (fast, no database needed). Integration tests test multiple pieces working together (slower, need a real database). This project has unit tests for domain models.

---

## Code Concepts

**Q: What does async/await mean?**

JavaScript doesn't block on slow operations (like database calls). `async` marks a function as asynchronous. `await` pauses that function until the async operation completes, then continues. Makes async code look like synchronous code.

---

**Q: What is middleware in Express?**

A function that runs between the incoming request and the route handler. It can check a token, parse the body, log the request, then calls `next()` to pass control along. `authenticateToken` and `requireRoles` are middleware in this project.

---

**Q: Front-end vs back-end role check — what's the difference?**

The front-end role check **hides content** for a better UX. It is NOT real security — users could bypass it. The back-end `requireRoles` middleware is the **real security boundary** — it rejects unauthorised API requests with 401/403 even if you bypass the front-end entirely.

---

## Improvement / Critical Thinking

**Q: What would you improve with more time?**

- More tests (integration tests for API endpoints)
- Real-time updates with WebSockets
- Group stage before knockout rounds
- HTTPS and production-grade secrets
- Email notifications when a match is assigned

---

**Q: Is it a security problem that the JWT payload is readable?**

No. The payload is base64-encoded (readable) but the _signature_ is what provides security. If anyone modifies the payload, the signature becomes invalid and the server rejects the token. Never put sensitive data (passwords, etc.) in a JWT payload though.
