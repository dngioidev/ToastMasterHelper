# Changelog

All notable changes to TM Scheduler, newest first.

---

## [2026-04-07] — Phase 1: Working Skeleton
**Agent**: Copilot (main)
**Scope**: Backend, Frontend, Infrastructure

### Added
- **Backend** (`backend/`): Full NestJS scaffold with TypeScript strict mode
  - `src/main.ts` — bootstrap with global ValidationPipe, ExceptionFilter, TransformInterceptor
  - `src/app.module.ts` — root module wiring ConfigModule, TypeORM, Auth, Health
  - `src/config/` — database.config, jwt.config, data-source (TypeORM CLI)
  - `src/common/` — GlobalExceptionFilter, TransformInterceptor, JwtAuthGuard, `@Public()` decorator
  - `src/modules/auth/` — JWT login endpoint (`POST /api/v1/auth/login`), JwtStrategy, bcrypt validation
  - `src/modules/health/` — `GET /api/v1/health` via `@nestjs/terminus`
  - Unit tests for `AuthService` (5 tests, 100% passing)
- **Frontend** (`frontend/`): React 18 + Vite 5 + TailwindCSS scaffold
  - `src/main.tsx` — app bootstrap with QueryClientProvider + BrowserRouter
  - `src/app/` — App.tsx, router.tsx with protected route guard
  - `src/lib/` — Axios instance (api.ts), React Query client (queryClient.ts)
  - `src/features/auth/` — Zustand auth store, login API, `useLogin` hook, `LoginPage` component
  - `src/types/api.types.ts` — shared response types
  - Unit tests for `useAuthStore` (3 tests, 100% passing)
- **Docker** (`docker/`, root): backend.dockerfile, frontend.dockerfile, nginx.conf (multi-stage builds)
  - `docker-compose.yml` (base), `docker-compose.dev.yml` (hot-reload), `docker-compose.prod.yml` (resource limits)
  - `.env.example` with all required variables documented
  - `scripts/` — start.sh, stop.sh, reset.sh, logs.sh, migrate.sh, backup-db.sh
  - `.gitignore` at repo root

### Build Status
- Backend: `npm run build` ✅ | `npm test` ✅ (5/5)
- Frontend: `npm run build` ✅ | `npm test` ✅ (3/3)

---

## [2026-04-07] — Project initialisation
**Agent**: document
**Scope**: Entire project

### Added
- Workspace agent configuration (`.github/copilot-instructions.md`)
- Full agent roster (7 specialist agents in `.github/agents/`)
- Full skill set (7 skills in `.github/skills/`)
- File-specific instructions (4 instruction files)
- Wiki folder structure with all initial content
- Business domain documentation (online + offline TM rules)
- Tech stack documentation
- Roadmap and milestone planning

---

_Future entries will be added here by the `document` agent after each change._
