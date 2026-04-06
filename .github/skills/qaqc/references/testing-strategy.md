# Testing Strategy

## Testing Pyramid

```
         ┌────────────────┐
         │   E2E Tests    │  ← Playwright (~20 tests, full flows)
         │  (Playwright)  │
         └────────────────┘
       ┌──────────────────────┐
       │  Integration Tests   │  ← Supertest + NestJS (~30 tests)
       │  (API flows, routes) │
       └──────────────────────┘
     ┌────────────────────────────┐
     │       Unit Tests           │  ← Jest/Vitest (~200+ tests)
     │  (services, hooks, utils)  │
     └────────────────────────────┘
```

## Unit Test Coverage Targets
| Module | Target |
|--------|--------|
| SessionService | ≥ 85% |
| MemberService | ≥ 85% |
| ScheduleAlgorithmService | ≥ 95% (critical logic) |
| React hooks | ≥ 80% |
| React components | ≥ 70% (behavior focus) |

## Critical Test Scenarios

### Fair Rotation Algorithm
```typescript
it('should assign member with fewest role occurrences', () => {
  const members = [
    memberFactory({ name: 'Alice', roleCounts: { chairman: 3 } }),
    memberFactory({ name: 'Bob',   roleCounts: { chairman: 1 } }),
    memberFactory({ name: 'Carol', roleCounts: { chairman: 2 } }),
  ];
  const result = service.suggestForRole(Role.Chairman, members);
  expect(result.name).toBe('Bob');
});
```

### Level Gate Enforcement
```typescript
it('should reject evaluator with equal level to speaker', () => {
  const speaker = memberFactory({ project_level: 5 });
  const evaluator = memberFactory({ project_level: 5 });
  expect(() => service.validateEvaluatorPair(speaker, evaluator))
    .toThrow(BadRequestException);
});

it('should accept evaluator with higher level than speaker', () => {
  const speaker = memberFactory({ project_level: 5 });
  const evaluator = memberFactory({ project_level: 6 });
  expect(() => service.validateEvaluatorPair(speaker, evaluator)).not.toThrow();
});
```

### Boundary Values
```typescript
it('should not include level 10 member as speaker candidate', () => {
  const level10 = memberFactory({ project_level: 10, status: 'Active' });
  const result = service.findEligibleSpeakers([level10]);
  expect(result).toHaveLength(0);
});

it('should include level 9 member as speaker candidate', () => {
  const level9 = memberFactory({ project_level: 9, status: 'Active' });
  const result = service.findEligibleSpeakers([level9]);
  expect(result).toHaveLength(1);
});
```

## Test Factory Pattern
```typescript
// Use factories for test data — never hardcode raw objects
function memberFactory(overrides: Partial<Member> = {}): Member {
  return {
    id: uuid(),
    name: 'Test Member',
    status: MemberStatus.Active,
    project_level: 0,
    created_at: new Date(),
    ...overrides,
  };
}
```

## When to Write Tests
- **ALWAYS after** implementing a service method
- **ALWAYS after** implementing a React hook
- **BEFORE** marking a task done
- **AFTER** fixing a bug (regression test first)
