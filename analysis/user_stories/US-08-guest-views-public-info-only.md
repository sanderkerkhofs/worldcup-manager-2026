# US-08 Guest Views Public Info Only

## User Story

As a **guest**,  
I'm able to view public competition information,  
So that I can follow the current round without needing to log in.

## Roles Involved

- **GUEST** (unauthenticated) — read-only access to public fixtures

## Acceptance Criteria

- Guest can view the current round fixtures (upcoming and completed matches)
- Guest cannot access statistics, top-scorer rankings, or bracket management
- Guest cannot perform any create, update, or delete actions
- Guest receives a clear "access denied" or redirect message when navigating to protected pages
- Login and register pages are accessible to guests
- Guest view is the default landing page state when no session is present

## Wireframe

```text
+------------------------------------------------------+
| Tournament Overview (Guest)                          |
+------------------------------------------------------+
| Current Round: 8th Final                             |
|                                                      |
| Upcoming Fixtures                                    |
| Netherlands vs Germany   2026-06-22 18:00            |
| Argentina vs USA         2026-06-22 21:00            |
|                                                      |
| Completed Matches                                    |
| Spain 1 - 0 Brazil                                   |
|                                                      |
| [ Login as Admin or Referee ]                        |
|                                                      |
| Access denied: management actions require login.     |
+------------------------------------------------------+
```

## Domain Model Reference (schema.prisma)

| Model   | Key fields visible to guest                                  |
| ------- | ------------------------------------------------------------ |
| `Match` | `roundName`, `matchDate`, `homeScore`, `awayScore`, `status` |
| `Team`  | `name`, `countryFlag`, `countryShortName`                    |

## Business Rules

- Session-less requests default to `UserRole.GUEST` access level
- Routes for stats, admin, and referee management return `401 Unauthorized` for unauthenticated requests
- Login (`POST /auth/login`) and register (`POST /auth/register`) are public endpoints
- Public fixture endpoint (`GET /matches` or similar) does not require authentication
