# 04 — Authentication & Security

> **How users log in, how sessions work, and how the app stays secure.**

---

## Authentication vs Authorisation

- **Authentication** — _"Who are you?"_ — verifying identity via username/password → issuing a token
- **Authorisation** — _"Are you allowed to do this?"_ — checking the user's role for each action

---

## Password hashing: bcrypt

Passwords are **never stored in plain text**. bcrypt hashes them:

```ts
// On register: hash before storing
const hash = await bcrypt.hash("password123", 12);
// "password123" → "$2b$12$5K9..." (irreversible)

// On login: compare entered password with stored hash
const isValid = await bcrypt.compare("password123", storedHash); // true/false
```

Why bcrypt over SHA256? bcrypt is **intentionally slow** — makes brute-force attacks impractical. It also adds a **salt** — same password always produces a different hash, defeating rainbow table attacks.

---

## JWT — JSON Web Tokens

After a successful login the server issues a **JWT token**. Structure: `header.payload.signature`

- **Header** — algorithm used
- **Payload** — the data (user ID, username, role) — base64 encoded, readable by anyone
- **Signature** — created with a secret key — proves the token was not tampered with

```ts
// Issuing a token after login
const token = jwt.sign(
  {
    sub: user.id,
    username: user.username,
    role: user.role,
    teamId: user.teamId,
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" },
);

// Verifying a token on each protected request
const payload = jwt.verify(token, process.env.JWT_SECRET); // throws if invalid
```

The client stores the token in `localStorage` and sends it with every request:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

## User roles

| Role    | Who            | Permissions                           |
| ------- | -------------- | ------------------------------------- |
| ADMIN   | System admin   | Everything                            |
| REFEREE | Match official | Only their assigned matches           |
| USER    | Registered fan | Read-only — matches, standings, stats |
| GUEST   | Public visitor | Very limited read access              |

---

## Role enforcement in code

```ts
// Controller — route level protection
matchRouter.patch(
  "/:matchId/status",
  authenticateToken, // must have a valid JWT
  requireRoles("ADMIN", "REFEREE"), // must have right role
  asyncHandler(handler),
);

// Service — fine-grained check (referee can only update their own match)
function assertMatchAccess(actor, refereeId) {
  if (actor.role === "ADMIN") return;
  if (actor.role === "REFEREE" && actor.id === refereeId) return;
  throw new ForbiddenError(
    "Only the assigned referee or admin can update this match.",
  );
}
```

---

## Security: Helmet & CORS

```ts
// Helmet — adds security HTTP headers automatically
app.use(helmet());

// CORS — allows the front-end (different port) to call the API
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // e.g. 'http://localhost:8080'
    credentials: true,
  }),
);
```

---

## Environment variables

Secrets are never hardcoded. They come from a `.env` file:

```ini
JWT_SECRET=your-super-secret-key
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:8080
```

The `.env` file is excluded from git (in `.gitignore`) — never commit it!

---

## Front-end session management

The JWT is stored in `localStorage`. A React Context (`SessionContext`) provides the session state to all components:

```ts
const { token, user, isAuthenticated, setSession, logout } = useSession();
```
