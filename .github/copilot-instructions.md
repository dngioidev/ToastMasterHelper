# TM Scheduler — Workspace Agent Instructions

## Project Overview
**TM Scheduler** is a full-stack web application for scheduling ToastMasters English Club sessions (both online and offline). It is built with:
- **Backend**: NestJS (TypeScript), PostgreSQL (TypeORM)
- **Frontend**: ReactJS (TypeScript), Vite, TailwindCSS
- **Infrastructure**: Docker Compose

## Repo Structure
```
tm-scheduler/
├── backend/           # NestJS API server
├── frontend/          # React SPA
├── wiki/              # Project documentation (source of truth)
├── docker/            # Dockerfiles and compose files
├── .github/           # Agents, skills, prompts, instructions
└── docker-compose.yml
```

## Core Workflow Rules (MANDATORY for ALL agents)
1. **Read wiki first**: Before any feature work, read the relevant wiki section (do NOT re-read the entire wiki every request—only what's needed).
2. **Build before done**: Every task must end with a successful build (`npm run build` for both backend and frontend).
3. **Unit tests**: After implementing any function, write unit tests and ensure ALL old + new unit tests pass.
4. **E2E tests**: For feature-related changes, run Playwright E2E tests for the affected flow.
5. **Wiki sync**: After any change (feature, bug fix, decision), update the relevant wiki files.
6. **Bug tracking**: Any build/test failures must be recorded in `wiki/bugs/active-bugs.md` before attempting fixes.

## Agent Roster
| Agent | Trigger | Role |
|-------|---------|------|
| `backend` | NestJS, API, database, PostgreSQL, migration, module | Senior NestJS engineer |
| `frontend` | React, component, UI, page, state, hook | Senior React engineer |
| `product-owner` | Feature, requirement, scope, backlog, wiki update | Product Owner |
| `designer` | Design, UX, UI, layout, color, accessibility, wireframe | Senior UX/UI Designer |
| `qaqc` | Test, bug, quality, playwright, unit test, automation | Senior QA/QC analyst |
| `devops` | Docker, deploy, CI/CD, container, infra | DevOps engineer |
| `document` | Document, wiki, readme, write docs, static site | Documentation master |

## Tech Constraints
- TypeScript strict mode everywhere.
- NestJS modules follow feature-folder pattern (controller + service + module + dto + entity per feature).
- React uses functional components only — NO class components.
- All database changes require a TypeORM migration file.
- Secrets via `.env` only — never hardcoded.
- All API endpoints require DTO validation via `class-validator`.

## Domain: ToastMasters Scheduling
See `wiki/business-workflow/` for full rules. Key constraints:
- Members have `status` (Active/Leave) and `project_level` (0–10).
- Speakers must have `project_level < 10`.
- Evaluators must have `project_level > speaker's project_level`.
- Role rotation uses fair-assignment (least-used member first).
- Online session: weekly Wednesday 11:20, 2 speakers + 2 chairmen.
- Offline session: structured roles per `wiki/business-workflow/offline-session.md`.
