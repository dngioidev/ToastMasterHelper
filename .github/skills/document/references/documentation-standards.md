# Documentation Standards

## File Naming
| Type | Convention | Example |
|------|-----------|---------|
| Wiki overview | `README.md` | `wiki/features/README.md` |
| Feature spec | `kebab-case.md` | `online-session.md` |
| Decision log | chronological in `decisions.md` | — |

## Markdown Conventions
- **H1**: File title only (once per file)
- **H2**: Major sections
- **H3**: Subsections
- **Tables**: align columns, use for structured data > 3 items
- **Code blocks**: always include language identifier (\`\`\`typescript)
- **Links**: relative paths (`../features/dashboard.md`), never absolute
- **Dates**: ISO 8601 (`2026-04-07`)

## Status Emoji System
| Status | Emoji | Use |
|--------|-------|-----|
| Done | ✅ | Feature/task complete |
| In Progress | 🔄 | Currently being worked on |
| Planned | 📋 | Scheduled but not started |
| Blocked | ❌ | Blocked by dependency or issue |

## File Size Guidelines
- Keep files under 200 lines
- If a section grows beyond ~60 lines, consider splitting it into its own file
- README.md files are always overviews — never the full detail

## Agent Readability Requirements
- Every file must have a clear H1 title that describes its exact content
- Section headers must be meaningful (not "Misc" or "Notes")
- Lists and tables preferred over dense paragraphs
- Code examples use realistic values, not abstract placeholders

## Linking Strategy
- Link from README overview → detail file
- Link from feature spec → business workflow rule
- Link from changelog → affected wiki file
- NEVER duplicate content — always link to the source
