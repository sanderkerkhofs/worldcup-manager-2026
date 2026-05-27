# 10 - Definition of Done Checklist

Use this list to verify the rebuilt project is complete and consistent.

## Product and scope

- [ ] Single fixed competition configured
- [ ] Fixed rounds seeded (8/4/2/1)
- [ ] No out-of-scope features added

## Data model

- [ ] User, Team, Player, Match, Goal implemented
- [ ] All FK relations active
- [ ] Unique constraints active (username, team+shirt)
- [ ] Round metadata stored on Match

## Business logic

- [ ] Knockout draw prevention enforced
- [ ] Round lock enforced for later-stage edits
- [ ] Winner progression works automatically
- [ ] Goal scorer validation enforces available players only

## Authentication and roles

- [ ] JWT auth works end-to-end
- [ ] Password hashing with bcrypt
- [ ] Permission matrix enforced in backend
- [ ] Frontend role visibility mirrors backend policy
- [ ] Admin self-delete blocked

## API and docs

- [ ] Swagger live at `/api-docs`
- [ ] All routes documented
- [ ] At least one complete route for `GET`, `POST`, `PUT`, `DELETE`
- [ ] Error responses are clear and consistent

## Frontend

- [ ] Shared layout and role-aware nav
- [ ] Session provider and storage integration
- [ ] API services isolated from UI components
- [ ] Overview, matches, stats, admin, referee pages implemented
- [ ] Protected pages show clear access messaging

## i18n

- [ ] localized where possible but keep it simple
- [ ] ENG default, NL, FR
- [ ] Locale switch persists in storage

## Seed and environment

- [ ] Local PostgreSQL is reachable via configured `DATABASE_URL`
- [ ] Seed creates all required entities
- [ ] Demo credentials available and documented

## Testing

- [ ] Domain tests pass
- [ ] Service tests pass
- [ ] Manual Swagger verification done

## Consistency audit

- [ ] Role enum aligned in Prisma/backend/frontend/i18n
- [ ] Match status enum aligned in Prisma/backend/frontend/i18n
- [ ] Docs and implementation have no contradiction
