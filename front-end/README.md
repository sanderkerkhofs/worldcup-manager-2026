# Front-end

This folder contains the Next.js client for Tournament Manager.

## What is here

- `pages/` contains the routed pages.
- `components/` contains reusable UI pieces.
- `services/` isolates API calls from the UI.
- `lib/` contains the session and locale helpers.
- `styles/` contains the global visual system.

## Setup

1. Make sure the backend is running on port 3000.
2. Install dependencies if needed:

```console
npm install
```

3. Start the development server:

```console
npm run dev
```

## Notes

- The login page supports both login and registration.
- Tournament pages are protected by the session guard.
- Locale choice and session data are stored in browser storage for reuse.
