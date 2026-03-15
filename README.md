# Edu Portal (Monorepo)

This repository is a `pnpm` workspace managed with Turborepo.

## Quick start

1. Install dependencies: `pnpm install`
2. Create env file: copy `.env.example` → `.env`
3. Start Postgres (optional, for Prisma): `docker-compose up -d`
4. Run migrations (optional): `pnpm --filter @edu/server prisma:migrate`
5. Start dev servers:
   - API: `pnpm --filter @edu/server dev`
   - Web: `pnpm --filter @edu/web dev` (override port with `WEB_PORT=3100`)

Common tasks:

- Format: `pnpm format`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Build: `pnpm build`
