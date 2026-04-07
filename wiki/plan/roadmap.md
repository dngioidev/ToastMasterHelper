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
**Status**: ✅ Done

| Feature | Priority | Status | Wiki |
|---------|----------|--------|------|
| Member entity + migration | High | ✅ Done | `features/member-mgmt.md` |
| Member CRUD API | High | ✅ Done | `features/member-mgmt.md` |
| Member list UI | High | ✅ Done | `features/member-mgmt.md` |
| Status toggle (Active/Leave) | High | ✅ Done | `features/member-mgmt.md` |
| Project level tracker | High | ✅ Done | `features/member-mgmt.md` |
| Role count tracking | High | ✅ Done | `features/member-mgmt.md` |

## Phase 3 — Online Session Scheduling
**Target**: Create and manage online TM sessions
**Status**: ✅ Done

| Feature | Priority | Status | Wiki |
|---------|----------|--------|------|
| Session entity + migration | High | ✅ Done | `features/online-session.md` |
| Session CRUD API | High | ✅ Done | `features/online-session.md` |
| Speaker assignment (2 per session) | High | ✅ Done | `features/online-session.md` |
| Chairman assignment (main + sub) | High | ✅ Done | `features/online-session.md` |
| Auto-suggest roles | High | ✅ Done | `features/online-session.md` |
| Session timetable UI | High | ✅ Done | `features/online-session.md` |
| Fair rotation algorithm | High | ✅ Done | `business-workflow/scheduling-rules.md` |

## Phase 4 — Offline Session Scheduling
**Target**: Full offline TM session support
**Status**: ✅ Done

| Feature | Priority | Status | Wiki |
|---------|----------|--------|------|
| Offline role schema | High | ✅ Done | `features/offline-session.md` |
| All 10+ role assignments | High | ✅ Done | `features/offline-session.md` |
| Evaluator level gate | High | ✅ Done | `business-workflow/scheduling-rules.md` |
| Speaker progression (Passed flag) | High | ✅ Done | `features/offline-session.md` |
| Backup speaker assignment | Medium | ✅ Done | `features/offline-session.md` |
| Auto-suggest all roles | High | ✅ Done | `features/offline-session.md` |
| Offline timetable UI | High | ✅ Done | `features/offline-session.md` |

## Phase 5 — Dashboard & Analytics
**Target**: At-a-glance view of member participation
**Status**: ✅ Done

| Feature | Priority | Status | Wiki |
|---------|----------|--------|------|
| Member participation stats | High | ✅ Done | `features/dashboard.md` |
| Role count overview | High | ✅ Done | `features/dashboard.md` |
| Session calendar view | Medium | 📋 Planned | `features/dashboard.md` |
| Upcoming session reminder | Low | ✅ Done | `features/dashboard.md` |

## Phase 6 — Polish & Notifications
| Feature | Priority | Status | Wiki |
|---------|----------|--------|------|
| Session notes/events | Medium | 📋 Planned | — |
| Export schedule (PDF/CSV) | Low | 📋 Planned | — |
| Email/Zalo notification | Low | 📋 Planned | — |
