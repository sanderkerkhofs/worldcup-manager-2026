# GenAI Rebuild Documentation Pack

This folder is the clean source-of-truth documentation to recreate the full project with AI from scratch.

## How to use this folder

1. Read `00-project-charter.md` first.
2. Use `01` to `08` as implementation references.
3. Use `09-ai-rebuild-playbook.md` to generate the project in phases with AI.
4. Track progress with `10-definition-of-done-checklist.md`.

## File index

- `00-project-charter.md`
- `01-requirements.md`
- `02-user-stories.md`
- `03-domain-business-logic.md`
- `04-data-model-erd.md`
- `05-backend-architecture-api.md`
- `06-frontend-architecture-layout.md`
- `07-auth-roles-security.md`
- `08-seed-and-environments.md`
- `09-ai-rebuild-playbook.md`
- `10-definition-of-done-checklist.md`
- `11-recreation-analysis.md`

## Design intent

- Keep competition scope fixed to one tournament (`worldcup-manager-2026`).
- Keep the implementation simple but layered and testable.
- Preserve school requirements (Express + Next.js + Prisma + PostgreSQL + JWT + Swagger + Jest + i18n).
- Make all decisions explicit so AI generation stays consistent and clean.
