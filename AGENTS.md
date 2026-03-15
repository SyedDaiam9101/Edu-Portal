# Repository Guidelines

## Project Structure & Module Organization

- `apps/web/`: Web portal (Next.js-style `app/` routes, shared UI in `components/`, client utilities in `lib/`, state in `store/`).
- `apps/server/`: API server (TypeScript). Core code lives in `src/` with `controllers/` (HTTP handlers) and `services/` (business logic). Database lives in `prisma/`.
- `apps/mobile/`: Mobile app (Expo/React Native-style `app/` routes). Reusable UI in `components/`, data access in `services/`, state in `store/`.
- `packages/`: Shared workspace packages (`types/`, `ui/`, `utils/`, `validators/`) consumed by apps.
- `docs/`: Architecture and API notes (see `docs/api/`).
- `infrastructure/`: Docker/Nginx and helper scripts used for local/prod deployments.

## Build, Test, and Development Commands

This repo is organized as a `pnpm` workspace (see `pnpm-workspace.yaml`) and is intended to be orchestrated with Turborepo (`turbo.json`).

- Install dependencies: `pnpm install`
- Run an app locally (examples):
  - Web: `pnpm --filter web dev`
  - Server: `pnpm --filter server dev`
  - Mobile: `pnpm --filter mobile dev`
- Run workspace tasks (if configured): `pnpm -r build`, `pnpm -r lint`, `pnpm -r test` (or `turbo run build|lint|test`)
- Start the local stack (if used): `docker-compose up --build`

## Coding Style & Naming Conventions

- Prefer TypeScript for new code (`.ts`/`.tsx`).
- Match existing file naming patterns:
  - Server: `<domain>.(controller|service).ts` (e.g., `auth.controller.ts`, `fee.service.ts`)
  - React components: `PascalCase.tsx` (e.g., `StudentCard.tsx`)
  - Tests: `*.test.ts` / `*.test.tsx`
- Use lint/format tools when present (`.eslintrc.js`, `.prettierrc`) and keep diffs focused to the feature/fix.

## Testing Guidelines

- Server tests live in `apps/server/tests/unit/` and `apps/server/tests/integration/`.
- Mobile tests live in `apps/mobile/__tests__/`.
- Run tests via each package’s `test` script (e.g., `pnpm --filter server test`).

## Commit & Pull Request Guidelines

- Commit history favors short, descriptive subjects (e.g., “Initial commit”). Keep the first line ≤ 72 chars and make it action-oriented; add a scope prefix when helpful (e.g., `server: …`, `web: …`).
- PRs should include: what changed, how to test, and screenshots for UI changes. Link issues/tickets when applicable and call out any required env/migration steps.

## Security & Configuration Tips

- Don’t commit secrets. Use `.env.example` as a template and keep app-specific configuration inside each app when possible.
- If you touch database code, update `apps/server/prisma/` and include migration/seed instructions in the PR description.

