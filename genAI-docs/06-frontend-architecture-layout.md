# 06 - Frontend Architecture and Layout

## 1. Frontend goals

- show tournament state clearly
- enforce UX-level role restrictions
- keep API calls out of UI components
- keep components reusable and testable

## 2. Frontend stack

- Next.js (Pages Router)
- React + TypeScript
- SWR for server data fetching
- localStorage for JWT + user + locale

## 3. Target structure

```text
front-end/
  pages/
    _app.tsx
    index.tsx
    login.tsx
    register.tsx
    matches/index.tsx
    matches/[matchId].tsx
    stats.tsx
    admin.tsx
    referee.tsx
  components/
    Layout.tsx
    LoginForm.tsx
    DashboardPanels.tsx
  services/
    authService.ts
    competitionService.ts
  lib/
    api.ts
    useSession.tsx
    session.ts
    i18n.tsx
    matchStatus.ts
  styles/
    globals.css
  types/
    index.ts
```

## 4. Layout and navigation rules

- Global `Layout` wraps every page in `_app.tsx`.
- Navigation is role-aware:
  - guest: home/login/register
  - authenticated user: matches/stats
  - admin: admin page visible
  - referee: referee page visible
- Language switcher always available.

## 5. Page responsibilities

- `index.tsx`:
  - current round summary
  - top standings and top scorers preview
- `login.tsx` / `register.tsx`:
  - authentication forms
  - predefined account hints for demo
- `matches/index.tsx`:
  - grouped fixtures by round
- `matches/[matchId].tsx`:
  - match detail
  - status/result/goal edits by permitted roles
- `stats.tsx`:
  - standings and scorer tables
- `admin.tsx`:
  - simulate round
  - reset tournament
  - user management
- `referee.tsx`:
  - assigned matches list and quick actions

## 6. State and data flow

- Session context stores `token`, `user`, `isAuthenticated`.
- SWR keys include token scope where needed.
- Service modules call a shared API client wrapper.
- UI components do not call `fetch` directly.

## 7. Route guard policy

- Guests can access public pages only.
- Protected pages show clear access-denied messaging.
- Forbidden role should receive explanation, not blank page.

## 8. i18n policy

- support `nl`, `en`, `fr`
- translation dictionary key-based
- locale persisted in storage
- minimum pages translated:
  - home
  - login/register
  - matches or stats

## 9. UX consistency rules for rebuild

- Use consistent status badges and labels.
- Keep table columns aligned across pages.
- Keep actions disabled when business preconditions fail.
- Surface backend error messages in user-readable blocks.
