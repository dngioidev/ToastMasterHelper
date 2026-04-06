# TM Scheduler — Wiki

> The single source of truth for the TM Scheduler project.

## Project Status

| Area | Status | Last Updated |
|------|--------|-------------|
| Planning & Requirements | ✅ Done | 2026-04-07 |
| Backend API | 📋 Planned | — |
| Frontend UI | 📋 Planned | — |
| Database Schema | 📋 Planned | — |
| Docker / DevOps | 📋 Planned | — |
| E2E Tests | 📋 Planned | — |

## Quick Links

| Section | Description |
|---------|-------------|
| [Plan →](./plan/README.md) | Roadmap, milestones, sprint goals |
| [Features →](./features/README.md) | Feature specs and acceptance criteria |
| [Business Workflow →](./business-workflow/README.md) | ToastMasters domain rules |
| [Tech Stack →](./techstack/README.md) | Architecture and technology decisions |
| [Bugs →](./bugs/README.md) | Active and resolved bug tracking |
| [History →](./history/README.md) | Changelog and decision log |

## Project Summary

**TM Scheduler** automates scheduling for a ToastMasters English Club, handling both **online** and **offline** session types.

- **Online sessions**: Weekly Wednesday 11:20, 2 speakers + 2 chairmen
- **Offline sessions**: Structured role matrix (Speaker, Evaluator, Toast Master, GE, etc.)
- **Core rules**: Project-level gates for speakers/evaluators, fair rotation algorithm
- **Stack**: NestJS + PostgreSQL (backend), React + TailwindCSS (frontend), Docker

## Agent Roster

| Agent | Invoked for |
|-------|------------|
| `backend` | API, database, NestJS modules |
| `frontend` | React components, UI, hooks |
| `product-owner` | Features, requirements, wiki sync |
| `designer` | UX/UI, design system, wireframes |
| `qaqc` | Testing, bug tracking, quality |
| `devops` | Docker, deployment, scripts |
| `document` | Documentation, wiki maintenance |
