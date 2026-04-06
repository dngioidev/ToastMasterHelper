---
name: product-owner
description: "Use when: planning features, writing user stories, defining acceptance criteria, backlog grooming, updating wiki after changes, feature scoping, brainstorming product ideas, checking project status, reviewing business rules, prioritising roadmap"
argument-hint: "Describe the product task (e.g., 'break down offline session scheduling feature')"
---
# Product Owner Skill

Product ownership and wiki stewardship for the TM Scheduler.

## When to Use
- Defining or refining a new feature
- Writing acceptance criteria and user stories
- Brainstorming product improvements
- Updating wiki after any implementation change
- Reviewing project status and roadmap
- Resolving scope questions

## Procedure
1. **Read status** — load `wiki/README.md` for project overview
2. **Read relevant feature** — `wiki/features/<feature>.md`
3. **Understand domain** — refer to `wiki/business-workflow/` as needed
4. **Draft/update feature** — apply the Feature Template
5. **Update roadmap** — `wiki/plan/roadmap.md`
6. **Log change** — add entry to `wiki/history/changelog.md`

## Reference Files
- [Wiki Update Protocol](./references/wiki-update.md)
- [Feature Template](./references/feature-template.md)

## Feature Template
```markdown
# Feature: <Name>
**Status**: Draft | In Progress | Done
**Priority**: High | Medium | Low
**Epic**: <parent>
**Owner**: Product Owner

## Problem Statement
<What problem does this solve for ToastMasters members?>

## User Stories
- As a [role], I want [capability] so that [benefit]

## Acceptance Criteria
- [ ] AC1: Given [context] When [action] Then [outcome]
- [ ] AC2: ...

## Business Rules Applied
- Rule from `wiki/business-workflow/`

## Out of Scope (v1)
- What this explicitly does NOT cover

## Design Notes
Link to `wiki/features/<feature>.md#design-decisions`

## Technical Notes
- Key implementation hints for dev team
```

## Wiki Sync Checklist
After ANY change, verify:
- [ ] Feature file updated
- [ ] Roadmap status updated
- [ ] Changelog entry added
- [ ] Bug resolved? → move from active to resolved bugs
- [ ] Tech decision? → update techstack docs

## Domain Rules (Quick Reference)
- `project_level < 10` = eligible speaker
- `project_level > speaker level` = eligible evaluator
- Role rotation: least-assigned member first (fair rotation)
- Online: weekly Wednesday 11:20, 2 speakers + 1 main + 1 sub chairman
- Offline: structured roles, see `wiki/business-workflow/offline-session.md`
