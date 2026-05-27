# 07 - Auth, Roles, and Security

## 1. Authentication model

- JWT bearer token auth.
- Login response:
  - user payload (id, username, role, teamId)
  - token
- Token attached in `Authorization: Bearer <token>`.

## 2. Password policy

- Passwords hashed with bcrypt.
- Never store plain text passwords.
- Registration must reject duplicate usernames (case-insensitive).

## 3. Role model (canonical)

- `ADMIN`
- `REFEREE`
- `USER`
- `GUEST`

## 4. Permission matrix

| Capability                          | Admin | Referee       | User | Guest |
| ----------------------------------- | ----- | ------------- | ---- | ----- |
| View public competition             | Yes   | Yes           | Yes  | Yes   |
| View protected pages                | Yes   | Yes           | Yes  | No    |
| Simulate round                      | Yes   | No            | No   | No    |
| Reset tournament                    | Yes   | No            | No   | No    |
| Manage users                        | Yes   | No            | No   | No    |
| Update assigned match status/result | Yes   | Yes           | No   | No    |
| Update unassigned match             | Yes   | No            | No   | No    |
| Add/edit goals                      | Yes   | Assigned only | No   | No    |
| Update player availability          | Yes   | No            | No   | No    |
| Create/delete players               | Yes   | No            | No   | No    |

## 5. Authorization rules

- Backend is source of truth.
- Frontend only mirrors permissions for UX.
- Every protected route uses middleware role checks.
- Actor identity from token determines assignment checks.

## 6. Security middleware and headers

- Helmet enabled globally.
- CORS origin whitelist configurable via env.
- JSON parsing with body size defaults or explicit limits.
- Standard error format to avoid leaking internals.

## 7. Security tests to include

- unauthorized request rejected
- wrong role request rejected
- referee blocked on unassigned match
- admin self-delete blocked
- invalid/expired token rejected

## 8. Known consistency guardrails for clean rebuild

- keep role enum synchronized across:
  - Prisma schema
  - backend types
  - frontend types
  - UI labels/i18n
- keep status enum synchronized across same layers
