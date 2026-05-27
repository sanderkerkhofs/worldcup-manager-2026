# 08 - Seed Data and Environments

## 1. Environment variables

## Backend env

- `APP_PORT`
- `DATABASE_URL=postgresql://tournament:tournament@localhost:5432/tournament_manager?schema=public`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`

## Frontend env

- `NEXT_PUBLIC_API_BASE_URL`

## 2. Runtime assumption

- PostgreSQL is already running locally and reachable with the configured `DATABASE_URL`.
- Backend and frontend run as local processes (`npm start` / `npm run dev`).

## 3. Seed strategy

### Reset order

1. goals
2. matches
3. players
4. users
5. teams

### Insert order

1. users (admin, referees, users)
2. teams (16 randomized)
3. players (15/team)
4. matches (all rounds pre-created)

## 4. Seeded rounds

- Round 1: teams assigned, ready to start
- Round 2-4: teams null until progression

## 5. Seeded account policy

- include at least one login per major role
- include clear demo credentials shown on login page
- never seed production-like secrets

## 6. Seed validation checklist

- exactly 16 teams present
- exactly 15 players per team
- exactly 15 matches total (8 + 4 + 2 + 1)
- all first-round matches have teams
- all later-round matches start empty
- match referees assigned in rotation for referee demos

## 7. Reset behavior contract

- delete all goals
- reset first round to active state
- clear later-round team assignments and scores
- restore proper statuses for restart

## 8. Dev scripts expected

Backend scripts:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm test`
- `npm start`

Frontend scripts:

- `npm run dev`
- `npm run build`
- `npm start`
