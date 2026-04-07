---
description: "Use when: completing any task, checking workflow requirements, understanding the MANDATORY completion checklist, build requirements, wiki sync, test requirements across all agents"
---
# Universal Workflow Rules

## MANDATORY Completion Checklist
Every task — regardless of which agent handles it — MUST complete ALL applicable steps:

### Code Changes
- [ ] `npm run build` passes in `backend/` (if backend changed)
- [ ] `npm run build` passes in `frontend/` (if frontend changed)
- [ ] All unit tests pass: `npm run test`
- [ ] No new TypeScript errors: `tsc --noEmit`

### Testing
- [ ] Unit tests written for all new service methods (backend)
- [ ] Unit tests written for all new hooks (frontend)
- [ ] ALL existing tests still pass (no regressions)
- [ ] E2E test written/updated for the affected feature flow

### Documentation (Wiki Sync)
- [ ] Relevant `wiki/features/<feature>.md` updated
- [ ] `wiki/business-workflow/<feature>.md` display rules verified against actual UI
- [ ] `wiki/plan/roadmap.md` updated if feature status changed
- [ ] `wiki/history/changelog.md` entry added (dated)
- [ ] `wiki/techstack/` updated if tech decision was made

> **UI Display Rule**: Any change to how member names, roles, or sessions are displayed in the frontend MUST be reflected in the matching `wiki/business-workflow/` section before the task is considered done.

### Bugs
- [ ] Any build or test failures logged in `wiki/bugs/active-bugs.md` before fixing
- [ ] Resolved bugs moved to `wiki/bugs/resolved-bugs.md`

## Agent Trigger Guide
Read the request carefully and use the most appropriate agent:

| Request Contains | Use Agent |
|-----------------|-----------|
| NestJS, API, entity, migration, service, controller, DTO | `backend` |
| React, component, hook, TailwindCSS, page, UI, state | `frontend` |
| Feature, requirement, user story, backlog, scope | `product-owner` |
| Design, layout, wireframe, color, UX, accessibility | `designer` |
| Test, bug, playwright, unit test, coverage, QA | `qaqc` |
| Docker, deploy, compose, infra, nginx, script | `devops` |
| Document, wiki, readme, changelog, static site | `document` |

## Wiki Read Strategy
- Read ONLY what is needed for the current request
- Full wiki re-read is NEVER required
- For domain context: `wiki/business-workflow/README.md` (overview only)
- For feature work: specific `wiki/features/<feature>.md`
- For tech decisions: specific `wiki/techstack/<area>.md`
