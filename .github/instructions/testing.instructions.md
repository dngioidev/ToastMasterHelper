---
description: "Use when: writing test files, Jest tests, Vitest tests, Playwright E2E specs, test utilities, mock factories, test setup files"
applyTo: "**/*.{spec,test}.{ts,tsx},e2e/**/*.ts"
---
# Testing Standards

## Naming
- Test file: `<module>.service.spec.ts` or `<Component>.test.tsx`
- Describe block: the unit under test (`describe('SessionService', ...)`)
- It block: behaviour description (`it('should assign evaluator with higher level', ...)`)
- Follow "should" + expected behaviour pattern

## Test Structure (AAA)
```typescript
it('should [expected behaviour]', () => {
  // Arrange — set up data and mocks
  // Act — call the function/render the component
  // Assert — verify the outcome
});
```

## Backend Unit Test Requirements
- Mock ALL external dependencies (repos, services, config)
- Use `createMockRepo()` factory for TypeORM repositories
- Test both happy path AND error paths
- Test boundary values (level 0, level 9, level 10)

## Frontend Unit Test Requirements
- Use `render` + `screen` from React Testing Library
- Prefer `getByRole` over `getByTestId` (accessibility-driven queries)
- Test user behaviour (click, type, submit) not implementation details
- Mock API calls with `vi.mock` or MSW handlers

## Playwright E2E Requirements
- Use Page Object Model for reusable page interactions
- Use `data-testid` only when no accessible selector works
- Always test happy path + validation error path
- Clean up test data after each test

## Forbidden Patterns
- Snapshot tests (brittle, not behaviour-focused)
- `setTimeout` in tests (use fake timers or `waitFor`)
- `any` type in test mocks
- Skipping tests with `it.skip` without a comment explaining why
