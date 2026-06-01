# 04 - Frontend, State, and UI Responsibilities

## 1. Session & Authentication State Management

`useSession` hook manages authentication state:

```typescript
{
  token: string | null;        // JWT token from login
  user: {
    id: string;
    username: string;
    role: 'ADMIN' | 'REFEREE' | 'USER';
  } | null;
  isAuthenticated: boolean;    // true if token exists
  setSession(user, token);     // Login action
  logout();                    // Logout action
}
```

**Persistence:**

- Session stored in browser localStorage
- Rehydrated on page load
- Automatic cleanup on logout

## 2. Role-Based Access & Data Fetching

The frontend uses role-aware data fetching:

**Session Flags:**

- `isAuthenticated` - boolean flag (token present)
- `user?.role` - one of: ADMIN, REFEREE, USER, or undefined (GUEST)

**Protected Pages:**

- Check `isAuthenticated` before rendering
- Check `user?.role` for role-specific content
- Redirect unauthenticated users to `/login`

**Data Visibility:**

- Statistics panels (standings, top scorers) only rendered for authenticated users
- Match editing only shown to ADMIN or assigned REFEREE
- Guest users see current round fixtures only

**Data Fetching:**

- Uses SWR library for data caching and revalidation
- Automatic retry on network failure
- Predictable async state: `{ data, isLoading, error, mutate }`
- Pages call typed API service functions from `front-end/services/`

## 3. Page Structure & Responsibilities

### Public Pages (Unauthenticated Access)

**`/login`** - Login form

- POST `/api/auth/login`
- Updates session with token and user
- Redirects to `/` on success

**`/register`** - Registration form

- POST `/api/auth/register`
- Creates USER role account
- Auto-logs in on success

**`/` (Dashboard - Home)** - Main entry point

- Shows current round fixtures (always visible)
- Displays standings & top scorers for authenticated users only
- Quick-view match status and scores
- Guest users see public info; authenticated users see all data

### Authenticated Pages

**`/admin`** (ADMIN only)

- Tournament simulation controls (Simulate Round button)
- Tournament reset (Reset all matches)
- User management panel (list, delete users)
- Full standings and top-scorer view
- Match editing capabilities

**`/referee`** (REFEREE only)

- Queue of assigned matches
- Quick match status update interface
- Goal scorer entry form
- Match result submission
- Only assigned first-stage matches shown

**`/stats`** (Authenticated: ADMIN, REFEREE, USER)

- Top scorers ranking with goal counts
- Team standings with points
- Historical stats and trends
- Read-only view of tournament statistics

**`/matches/[matchId]`** - Match Detail

- Match information and teams
- Current status and score
- Goal list with scorers
- Edit controls (for ADMIN or assigned REFEREE)
- Public read-only view for guests

**`/rounds/[roundId]`** - Round/Stage Bracket

- All matches in round (stage)
- Bracket visualization
- Match status flow
- Team advancement indicators

## 4. Frontend Folder Organization

```
front-end/
├── pages/
│   ├── _app.tsx           # App wrapper, session provider
│   ├── index.tsx          # Dashboard / home
│   ├── login.tsx          # Login page
│   ├── register.tsx       # Registration page
│   ├── admin.tsx          # Admin panel (ADMIN only)
│   ├── referee.tsx        # Referee interface (REFEREE only)
│   ├── stats.tsx          # Statistics (authenticated)
│   ├── matches/
│   │   └── [matchId].tsx  # Match detail editing
│   ├── rounds/
│   │   └── [roundId].tsx  # Round/stage bracket
│   └── tournaments/
│       └── (future expansion)
├── components/
│   ├── Layout.tsx         # Main layout wrapper
│   ├── DashboardPanels.tsx # Dashboard card components
│   ├── LoginForm.tsx      # Reusable login form
│   └── (other shared components)
├── services/
│   ├── authService.ts     # Login, register, logout
│   ├── competitionService.ts  # Tournament operations
│   └── (other API services)
├── lib/
│   ├── useSession.tsx     # Session hook
│   ├── session.ts         # Session utilities
│   ├── i18n.tsx           # Internationalization
│   ├── matchStatus.ts     # Match status helpers
│   └── api.ts             # API client setup
├── types/
│   └── index.ts           # Shared DTOs and types
└── styles/
    ├── globals.css        # Global Tailwind
    └── (component styles)
```

## 5. API Service Layer

Services provide typed wrappers around API endpoints:

```typescript
// competitionService.ts
getOverview()                          // GET /api/competition
getRounds()                            // GET /api/competition/rounds
simulateRound(roundId: string | number) // POST /api/competition/rounds/:roundId/simulate
resetMatches()                         // POST /api/competition/reset-matches

// Match service methods
getMatches()                           // GET /api/matches
getTopScorers()                        // GET /api/matches/top-scorers
getMatch(matchId)                      // GET /api/matches/:matchId
updateMatchStatus(matchId, status)     // PATCH /api/matches/:matchId/status
updateMatchResult(matchId, result)     // PUT /api/matches/:matchId/result
addGoal(matchId, goal)                 // POST /api/matches/:matchId/goals
updateGoal(matchId, goalId, goal)      // PATCH /api/matches/:matchId/goals/:goalId

// Auth service
login(username, password)              // POST /api/auth/login
register(username, password)           // POST /api/auth/register
getCurrentUser()                       // GET /api/auth/me (requires token)
```

**Conventions:**

- All services return typed responses (DTOs from `types/index.ts`)
- Errors are caught and rethrown with descriptive messages
- API errors (401, 403, 404, 422) are mapped to user-friendly messages
- Services assume authentication headers are attached automatically

## 6. UI Design Patterns

### Component Structure

**Reusable Card Styles:**

- `heroCard` - Summary/hero sections (large, prominent)
- `panelCard` - Operational panels (admin, referee controls)
- `tableWrap` - Scroll-safe tables (standings, match lists)

**Consistency:**

- Bootstrap 5 for base components (buttons, forms, modals)
- Tailwind CSS for utility styling and responsive layout
- Font Awesome icons for visual indicators
- Consistent color scheme for match status

### Match Status Display

Frontend displays match status consistent with backend:

| Status      | Display     | Badge Color |
| ----------- | ----------- | ----------- |
| PLANNED     | Not Started | Gray        |
| NOT_STARTED | Ready       | Yellow      |
| IN_PROGRESS | In Progress | Blue        |
| FINISHED    | Finished    | Green       |

## 7. Error Handling & User Feedback

**Error Display:**

- Toast notifications for API errors (toastr library)
- Form validation messages for input errors
- Page-level error states with retry buttons
- Loading spinners during data fetch

**Recovery:**

- Failed API calls show error message and retry button
- Invalid token redirects to login
- Permission denied (403) shows "Not authorized" message
- Network errors show connectivity message with retry

## 8. Request Lifecycle Example

For updating a match result as REFEREE:

1. Referee enters score and goals on `/referee` or `/matches/[matchId]`
2. Form submits to `competitionService.updateMatchResult(matchId, result)`
3. Service includes JWT token in Authorization header
4. Backend validates token (JWT middleware)
5. Backend validates REFEREE is assigned to match (service-level check)
6. Prisma updates match and creates Goal records
7. Backend returns updated match data
8. Frontend SWR cache updates
9. UI re-renders with new score
10. Toast notification shows "Match updated successfully"

## 9. Practical Debugging Tips

When debugging frontend issues:

1. **Check session state**: `console.log(useSession())` in component
2. **Inspect API calls**: Check browser Network tab for request/response
3. **Verify service call**: Trace `competitionService.getMatches()` etc.
4. **Check role permissions**: Verify `user?.role` matches expected permission
5. **Look at SWR state**: Use React DevTools to inspect SWR hooks
6. **Trace to backend**: Compare frontend request to backend controller code
7. **Verify domain rules**: Check if backend service is enforcing rules

## 10. Key Conventions

- **Pages** check `isAuthenticated` and `user?.role` before rendering protected content
- **Components** receive data as props, don't directly call APIs
- **Services** always return typed data; front-end never parses raw JSON
- **Error handling** is centralized in service layer
- **Round identifiers** can be numeric (1-4) or string names (quarterFinal, etc.)
- **Timestamps** are ISO strings; front-end formats for display
