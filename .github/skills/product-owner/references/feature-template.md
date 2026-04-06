# Feature Template

Use this template when creating a new feature file in `wiki/features/`.

```markdown
# Feature: <Name>
**Status**: Draft | In Progress | Done
**Priority**: High | Medium | Low
**Phase**: <phase number>
**Owner**: Product Owner

## Problem Statement
<What problem does this solve for ToastMasters members?>
<One paragraph, user-focused, explains the pain point>

## User Stories
- As a [role], I want [capability] so that [benefit]
- As a [role], I want [capability] so that [benefit]

## Acceptance Criteria
- [ ] AC1: Given [context] When [action] Then [outcome]
- [ ] AC2: Given [context] When [action] Then [outcome]
- [ ] AC3: (add as many as needed)

## Business Rules Applied
- Rule from `wiki/business-workflow/<file>.md`
- (list applicable rules explicitly)

## Out of Scope (v1)
- What this explicitly does NOT cover in the first release
- (helps prevent scope creep)

## Design Decisions
| Decision | Option A | Option B | Chosen | Reason |
|----------|----------|----------|--------|--------|
| [UI question] | ... | ... | ... | ... |

## Technical Notes
- Key entities/tables affected
- API endpoints needed
- Migration required? (yes/no)
- Any gotchas or constraints for the dev team
```
