# Wiki Update Protocol

## When to Update Wiki
The wiki MUST be updated after:
- Any feature implementation (update `wiki/features/<feature>.md`)
- Any tech decision or config change (update `wiki/techstack/<area>.md`)
- Any bug found (add to `wiki/bugs/active-bugs.md`)
- Any bug fixed (move to `wiki/bugs/resolved-bugs.md`)
- Any planning change (update `wiki/plan/roadmap.md`)

## Update Checklist
```
[ ] Feature file updated with what changed and why
[ ] Roadmap status updated if feature phase completed
[ ] Changelog entry added (wiki/history/changelog.md)
[ ] wiki/README.md project status table updated if overall status changed
[ ] No placeholder text left (no TODO/TBD without date)
[ ] No broken relative links
```

## Minimal Update Strategy
- Read ONLY the affected files before updating
- Apply targeted edits — do not rewrite entire files
- Update status values and dates in tables
- Add changelog entry at the top of the changelog

## Changelog Entry Template
```markdown
## [YYYY-MM-DD] — <10-word summary>
**Agent**: backend | frontend | devops | qaqc | design | po | document
**Scope**: `wiki/features/<feature>.md`

### Added
- ...

### Changed
- ...

### Fixed
- Bug BUG-NNN resolved
```

## Status Value Reference
| Field | Allowed Values |
|-------|---------------|
| Feature Status | Draft, In Progress, Done, Deprecated |
| Priority | High, Medium, Low |
| Bug Status | Open, In Progress, Resolved |
| Bug Severity | Critical, High, Medium, Low |
