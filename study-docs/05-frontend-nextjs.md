# 05 — Frontend & Next.js

> **How the user interface is built with React and Next.js.**

---

## Folder structure

| Folder        | Purpose                              |
| ------------- | ------------------------------------ |
| `pages/`      | Each file = one URL route            |
| `components/` | Reusable UI building blocks          |
| `services/`   | Functions that call the back-end API |
| `lib/`        | Session management, i18n, API client |
| `styles/`     | Global CSS                           |
| `types/`      | TypeScript type definitions          |

---

## Pages (file-based routing)

| File                 | URL            | Access            |
| -------------------- | -------------- | ----------------- |
| `pages/index.tsx`    | `/`            | Everyone          |
| `pages/login.tsx`    | `/login`       | Unauthenticated   |
| `pages/register.tsx` | `/register`    | Unauthenticated   |
| `pages/matches/`     | `/matches/*`   | Logged-in users   |
| `pages/stats.tsx`    | `/stats`       | Logged-in users   |
| `pages/referee.tsx`  | `/referee`     | REFEREE role only |
| `pages/admin.tsx`    | `/admin`       | ADMIN role only   |
| `pages/_app.tsx`     | (root wrapper) | Wraps every page  |

---

## React hooks used

### useState

```ts
const [message, setMessage] = useState<string | null>(null);
// 'message' holds the current value
// 'setMessage' updates it and triggers a re-render
```

### useEffect

```ts
useEffect(() => {
  setToken(readStoredToken()); // runs once when component mounts
}, []); // empty [] = run only once
```

### useMemo

```ts
const orderedRounds = useMemo(
  () => [...rounds].sort((a, b) => a.orderNumber - b.orderNumber),
  [rounds], // only recalculates when 'rounds' changes
);
```

---

## Data fetching with SWR

```ts
const { data: overview, isLoading, error, mutate } = useSWR(
  token ? ['overview', token] : null, // null = don't fetch yet
  () => getOverview(token)             // the fetch function
);

if (isLoading) return <p>Loading...</p>;
if (error)     return <p>Error!</p>;

return <p>{overview.competition.name}</p>;

// After a mutation (e.g., score was updated):
mutate(); // re-fetches and updates the UI
```

---

## API service layer

```ts
// lib/api.ts — wraps fetch() with auth headers
const api = {
  get: (path, token) =>
    fetch(BASE_URL + path, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(handleResponse),
};

// services/competitionService.ts — semantic function names
export function getOverview(token) {
  return api.get("/api/competition", token);
}
```

---

## Internationalisation (i18n)

The app supports Dutch (NL), English (EN), and French (FR):

```ts
const { t, locale, setLocale } = useI18n();

// Instead of:
<h2>Huidige ronde</h2>

// You write:
<h2>{t('homeCurrentRound')}</h2>
// Maps to "Huidige ronde" (NL), "Current Round" (EN), "Tour Actuel" (FR)
```

---

## Role-based page access pattern

```ts
export default function AdminPage() {
  const { token, user } = useSession();

  // Guard: if not ADMIN, show restricted message
  if (!token || user?.role !== 'ADMIN') {
    return <section><h2>Restricted Access</h2></section>;
  }

  // Real content only reaches here for ADMIN
  return <div>...admin content...</div>;
}
```

> **Note:** This is a UX convenience, not real security. The back-end `requireRoles` middleware is the actual security boundary.
