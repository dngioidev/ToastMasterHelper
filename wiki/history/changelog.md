# Changelog

All notable changes to TM Scheduler, newest first.

---

## [2026-04-08] — Phases 2–5: Core Feature Implementation
**Agent**: Copilot (main)
**Scope**: Backend, Frontend

### Added
- **Backend — Phase 2 (Member Management)**
  - `MemberEntity` (id, name, status enum Active/Leave, project_level 0–10, role_counts JSONB)
  - `MembersService`: CRUD, `findActiveMembers()`, `findEligibleSpeakers()`, `incrementRoleCount()`, `incrementProjectLevel()`
  - `MembersController`: REST endpoints `GET/POST /members`, `GET/PATCH/DELETE /members/:id`
  - Migration `1744000000000-CreateMembersTable`
  - 14 unit tests — all passing

- **Backend — Phase 3 (Online Sessions)**
  - `OnlineSessionEntity` with ManyToOne relations to Member for 4 roles
  - `OnlineSessionsService`: CRUD + `suggest(date)` auto-assignment algorithm (fair rotation, recency exclusion, level-gated speakers)
  - Migration `1744000001000-CreateOnlineSessionsTable`
  - 8 unit tests — all passing

- **Backend — Phase 4 (Offline Sessions)**
  - `OfflineSessionEntity` + `OfflineSessionAssignmentEntity` with `OfflineRole` enum (9 roles)
  - `OfflineSessionsService`: full role auto-suggest with evaluator gate (`project_level > speaker.project_level`), duplicate-assignment guard
  - Migration `1744000002000-CreateOfflineSessionsTable`
  - 13 unit tests — all passing

- **Backend — Phase 5 (Dashboard)**
  - `DashboardService.getStats()` aggregates total/active/leave members, session counts, next session dates, top members by role_counts
  - `DashboardController`: `GET /dashboard/stats`

- **Frontend — All Pages**
  - `AppLayout.tsx`: sidebar layout with NavLink navigation + Sign Out
  - Feature modules: `members/`, `online-sessions/`, `offline-sessions/`, `dashboard/`
  - Each feature: types, API client, React Query hooks, page component
  - `MembersPage`: searchable table with status badges, level badges, CRUD modal
  - `OnlineSessionsPage`: session table + auto-suggest modal (date picker, role preview)
  - `OfflineSessionsPage`: card grid + auto-suggest modal (configurable speaker count)
  - `DashboardPage`: stat cards, next session panels, top members table
  - Router updated with nested layout routes

### Changed
- `app.module.ts`: imports `MembersModule`, `OnlineSessionsModule`, `OfflineSessionsModule`, `DashboardModule`
- `router.tsx`: full route tree replacing "coming soon" placeholder

### Verified
- Backend: `npm run build` ✅ | `npm test` 35/35 pass ✅
- Frontend: `npm run build` ✅ | `npm test` 3/3 pass ✅

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
