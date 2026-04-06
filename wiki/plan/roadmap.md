# Roadmap

## Phase 1 — Project Setup & Infrastructure
**Target**: Initial working skeleton
**Status**: ✅ Done

| Feature | Priority | Status | Wiki |
|---------|----------|--------|------|
| NestJS project scaffold | High | ✅ Done | `techstack/backend.md` |
| React + Vite project scaffold | High | ✅ Done | `techstack/frontend.md` |
| PostgreSQL + TypeORM setup | High | ✅ Done | `techstack/database.md` |
| Docker compose (dev + prod) | High | ✅ Done | `techstack/devops.md` |
| CI/CD pipeline | Medium | 📋 Planned | — |
| Auth (JWT) | High | ✅ Done | — |

## Phase 2 — Member Management
**Target**: Full CRUD for members with status and project level

| Feature | Priority | Status | Wiki |
|---------|----------|--------|------|
| Member entity + migration | High | 📋 Planned | `features/member-mgmt.md` |
| Member CRUD API | High | 📋 Planned | `features/member-mgmt.md` |
| Member list UI | High | 📋 Planned | `features/member-mgmt.md` |
| Status toggle (Active/Leave) | High | 📋 Planned | `features/member-mgmt.md` |
| Project level tracker | High | 📋 Planned | `features/member-mgmt.md` |
| Role count tracking | High | 📋 Planned | `features/member-mgmt.md` |

## Phase 3 — Online Session Scheduling
**Target**: Create and manage online TM sessions

| Feature | Priority | Status | Wiki |
|---------|----------|--------|------|
| Session entity + migration | High | 📋 Planned | `features/online-session.md` |
| Session CRUD API | High | 📋 Planned | `features/online-session.md` |
| Speaker assignment (2 per session) | High | 📋 Planned | `features/online-session.md` |
| Chairman assignment (main + sub) | High | 📋 Planned | `features/online-session.md` |
| Auto-suggest roles | High | 📋 Planned | `features/online-session.md` |
| Session timetable UI | High | 📋 Planned | `features/online-session.md` |
| Fair rotation algorithm | High | 📋 Planned | `business-workflow/scheduling-rules.md` |

## Phase 4 — Offline Session Scheduling
**Target**: Full offline TM session support

| Feature | Priority | Status | Wiki |
|---------|----------|--------|------|
| Offline role schema | High | 📋 Planned | `features/offline-session.md` |
| All 10+ role assignments | High | 📋 Planned | `features/offline-session.md` |
| Evaluator level gate | High | 📋 Planned | `business-workflow/scheduling-rules.md` |
| Speaker progression (Passed flag) | High | 📋 Planned | `features/offline-session.md` |
| Backup speaker assignment | Medium | 📋 Planned | `features/offline-session.md` |
| Auto-suggest all roles | High | 📋 Planned | `features/offline-session.md` |
| Offline timetable UI | High | 📋 Planned | `features/offline-session.md` |

## Phase 5 — Dashboard & Analytics
**Target**: At-a-glance view of member participation

| Feature | Priority | Status | Wiki |
|---------|----------|--------|------|
| Member participation stats | High | 📋 Planned | `features/dashboard.md` |
| Role count overview | High | 📋 Planned | `features/dashboard.md` |
| Session calendar view | Medium | 📋 Planned | `features/dashboard.md` |
| Upcoming session reminder | Low | 📋 Planned | `features/dashboard.md` |

## Phase 6 — Polish & Notifications
| Feature | Priority | Status | Wiki |
|---------|----------|--------|------|
| Session notes/events | Medium | 📋 Planned | — |
| Export schedule (PDF/CSV) | Low | 📋 Planned | — |
| Email/Zalo notification | Low | 📋 Planned | — |
