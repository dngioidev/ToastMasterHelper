---
name: qaqc
description: "Use when: writing unit tests, writing Playwright E2E tests, creating test cases, manual browser testing, reporting bugs, QA review, test coverage analysis, regression testing, acceptance testing, finding edge cases, testing business rules, validating role assignment logic"
argument-hint: "Describe the QA task (e.g., 'write unit tests for SessionService', 'E2E test for online session flow')"
---
# QA/QC Skill

Senior QA/QC test engineering for the TM Scheduler.

## When to Use
- Writing unit tests after any new function/service method
- Writing Playwright E2E tests for feature flows
- Creating test cases for a feature's acceptance criteria
- Performing a QA review before marking a feature done
- Reporting and documenting a found bug

## Procedure
1. **Read acceptance criteria** — `wiki/features/<feature>.md`
2. **Read business rules** — `wiki/business-workflow/` for edge cases
3. **Write unit tests** — for all new service methods and React hooks
4. **Write E2E test** — for the feature's happy path and critical error paths
5. **Run all tests** — `npm run test` (both `backend/` and `frontend/`)
6. **Document bugs** — any failures → `wiki/bugs/active-bugs.md` first
7. **Fix/re-test cycle** — after fixes, re-run and confirm green

## Reference Files
- [Testing Strategy](./references/testing-strategy.md)
- [Bug Report Template](./references/bug-template.md)
- [E2E Patterns](./references/e2e-patterns.md)

## Test Commands
```bash
# Backend unit tests
cd backend && npm run test
cd backend && npm run test:cov   # with coverage report

# Frontend unit tests
cd frontend && npm run test

# E2E tests (requires running Docker stack)
cd e2e && npx playwright test
cd e2e && npx playwright test --ui   # interactive mode
```

## Test Priority Matrix
| Area | Priority | Test Type |
|------|----------|-----------|
| Role auto-suggest logic | Critical | Unit + E2E |
| Level gate enforcement | Critical | Unit |
| Fair rotation algorithm | Critical | Unit |
| Session CRUD | High | Integration + E2E |
| Member management | High | Unit + E2E |
| Dashboard aggregation | Medium | Unit |
| Auth flows | High | E2E |

## Edge Cases for TM Domain
- Speaker with `project_level = 9` (max speaker, can't be evaluated by level 9)
- Member switching Active ↔ Leave mid-schedule
- Session with 0 eligible speakers (all level 10)
- Same member assigned multiple roles (should warn)
- Evaluator with same level as speaker (should be blocked, level must be STRICTLY greater)

## Bug Severity Guide
- **Critical**: App crashes, data corruption, auth bypass
- **High**: Feature doesn't work, business rule violated
- **Medium**: Wrong data displayed, usability issue
- **Low**: Style issue, typo, minor cosmetic

## Test Coverage Targets
- Backend services: ≥ 80% line coverage
- Frontend hooks: ≥ 80% line coverage
- E2E: all acceptance criteria scenarios covered
