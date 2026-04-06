# Milestones

## M1 — Working Skeleton
**Target Date**: TBD
**Definition of Done**:
- [ ] Backend runs on port 3000 (`GET /health` returns 200)
- [ ] Frontend builds and serves on port 80
- [ ] PostgreSQL connects and migrations run
- [ ] `docker compose up` brings up all services
- [ ] Auth (JWT login) works end-to-end

## M2 — Member Management Complete
**Target Date**: TBD
**Definition of Done**:
- [ ] Full CRUD for members via API
- [ ] UI to list, add, edit, and deactivate members
- [ ] Project level updated when speaker passes
- [ ] Role counts tracked and queryable
- [ ] Unit tests ≥ 80% coverage for MemberService
- [ ] E2E test for member create → list → edit flow

## M3 — Online Sessions Live
**Target Date**: TBD
**Definition of Done**:
- [ ] Online session CRUD API
- [ ] Auto-suggest 2 speakers + 2 chairmen (fair rotation)
- [ ] Level 10 members excluded from speaker suggestions
- [ ] Timetable view (roles × dates matrix)
- [ ] All business rules from `wiki/business-workflow/online-session.md` implemented and tested
- [ ] E2E test for full online session creation flow

## M4 — Offline Sessions Live
**Target Date**: TBD
**Definition of Done**:
- [ ] All offline roles supported (Toast Master, Evaluator, GE, Timer, etc.)
- [ ] Evaluator level gate enforced (strictly > speaker level)
- [ ] Speaker `Passed` flag increments `project_level`
- [ ] Backup speakers supported
- [ ] Auto-suggest all roles
- [ ] All business rules from `wiki/business-workflow/offline-session.md` tested

## M5 — Dashboard & GA
**Target Date**: TBD
**Definition of Done**:
- [ ] Dashboard shows: next session date, role assignment status, member participation counts
- [ ] Mobile-responsive (375px minimum)
- [ ] Performance: Lighthouse ≥ 90 on all categories
