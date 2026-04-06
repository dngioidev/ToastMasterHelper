# Bug Report Template

## Format
File new bugs in `wiki/bugs/active-bugs.md` using this exact format:

```markdown
## BUG-<NNN>: <Short descriptive title>
**Severity**: Critical | High | Medium | Low
**Status**: Open | In Progress | Resolved
**Found**: YYYY-MM-DD
**Found by**: QA/QC Agent | Manual Test | User Report | Automated
**Reproduces**: Always | Intermittent | Rare
**Environment**: Local Dev | Docker | Production

### Steps to Reproduce
1. Navigate to [page/screen]
2. Perform [action]
3. Observe [unexpected result]

### Expected Behaviour
<What should have happened>

### Actual Behaviour
<What actually happened>

### Error Logs
```
<paste error stack trace or console output>
```

### Related
- Feature: `wiki/features/<feature>.md`
- Code: `backend/src/modules/<module>/<file>.ts` (approx line X)

### Fix Plan
<Brief description of how to fix — leave blank until investigated>
```

## Severity Guide
| Level | Criteria | SLA |
|-------|----------|-----|
| Critical | Data corruption, crash, auth bypass | Fix immediately |
| High | Feature broken, business rule violated | Fix this sprint |
| Medium | Wrong data shown, UX broken | Fix next sprint |
| Low | Visual/cosmetic issue | Backlog |

## Resolved Bug Format
When moving to `wiki/bugs/resolved-bugs.md`:
```markdown
## BUG-<NNN>: <Title> ✅
**Resolved**: YYYY-MM-DD
**Fixed in**: `backend/src/modules/...` or `frontend/src/features/...`
**Root Cause**: <Brief root cause>
**Fix Summary**: <What was changed>
**Regression Test**: `<test file>:<test name>`
```
