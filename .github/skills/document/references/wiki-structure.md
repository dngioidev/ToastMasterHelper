# Wiki Structure Guide

## Guiding Principles

### 1. Overview → Detail pattern
Every folder has a `README.md` that:
- Summarises what's in the folder (3–5 bullets or a table)
- Links to detail files
- Shows current status

Never put full detail in a README. Keep it to ≤ 50 lines.

### 2. One concern, one file
| Pattern | Example |
|---------|---------|
| One feature per file | `features/online-session.md` |
| One area per techstack file | `techstack/backend.md` |
| One workflow per business file | `business-workflow/scheduling-rules.md` |

### 3. Wiki folder map
```
wiki/
├── README.md                      ← Master dashboard
├── plan/
│   ├── README.md                  ← Sprint and phase overview
│   ├── roadmap.md                 ← Feature-level status table
│   └── milestones.md              ← Milestone definitions of done
├── history/
│   ├── README.md                  ← History overview
│   ├── changelog.md               ← All changes, newest first
│   └── decisions.md               ← ADR log
├── bugs/
│   ├── README.md                  ← Bug statistics
│   ├── active-bugs.md             ← BUG-NNN open issues
│   └── resolved-bugs.md           ← BUG-NNN resolved issues
├── features/
│   ├── README.md                  ← Feature list with status
│   ├── member-mgmt.md
│   ├── online-session.md
│   ├── offline-session.md
│   └── dashboard.md
├── techstack/
│   ├── README.md                  ← Tech decision overview
│   ├── backend.md
│   ├── frontend.md
│   ├── database.md
│   └── devops.md
└── business-workflow/
    ├── README.md                  ← Domain overview
    ├── online-session.md
    ├── offline-session.md
    └── scheduling-rules.md
```

### 4. When to add a new file
- A section in an existing file has grown beyond ~60 lines
- A new distinct topic emerges (new feature, new ADR, new workflow)
- A file is referenced from multiple places (extract to its own file)

### 5. When NOT to add a new file
- A single addition of < 10 lines to an existing file
- A one-time note → add inline to the relevant existing file

## Cross-linking Best Practices
```markdown
<!-- Link to another wiki file (relative) -->
See [Scheduling Rules](../business-workflow/scheduling-rules.md) for details.

<!-- Link to a specific section -->
See [ADR-001](../history/decisions.md#adr-001) for the decision rationale.

<!-- Reference code files (just the path, not a link) -->
Implementation: `backend/src/modules/sessions/sessions.service.ts`
```
