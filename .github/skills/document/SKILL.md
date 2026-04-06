---
name: document
description: "Use when: writing documentation, updating wiki files, creating README files, generating static documentation site with VitePress, writing changelogs, structuring docs folders, technical writing, API documentation, setup guides, keeping wiki in sync after changes"
argument-hint: "Describe the documentation task (e.g., 'update wiki after adding member module', 'write setup guide')"
---
# Document Skill

Technical writing and wiki architecture for the TM Scheduler.

## When to Use
- Updating `wiki/` after any code change
- Writing README or setup documentation
- Structuring new wiki sections
- Creating or maintaining the VitePress static site
- Writing clear changelogs and feature specs

## Procedure
1. **Identify what changed** — from request context or recent git changes
2. **Find affected wiki files** — use file search in `wiki/`
3. **Apply minimal updates** — edit only what needs changing
4. **Update dashboard** — `wiki/README.md` project status table
5. **Log changelog** — `wiki/history/changelog.md`
6. **Verify structure** — no broken links, no placeholder text

## Reference Files
- [Documentation Standards](./references/documentation-standards.md)
- [Wiki Structure Guide](./references/wiki-structure.md)
- [VitePress Setup](./references/vitepress-setup.md)

## Wiki Quality Checklist
- [ ] No `TODO` or `TBD` without a date
- [ ] All links resolve (relative paths)
- [ ] Tables are aligned and render correctly in Markdown
- [ ] Code blocks have language specifiers
- [ ] Dates are ISO 8601 (YYYY-MM-DD)
- [ ] Statuses use consistent emoji (✅ 🔄 📋 ❌)
- [ ] No duplicated content (use links instead)
- [ ] Human-readable AND agent-parseable structure

## Changelog Entry Format
```markdown
## [YYYY-MM-DD] — <Summary in 10 words or fewer>
**Agent**: backend | frontend | devops | qaqc | design | po
**Scope**: `wiki/features/<feature>.md`

### Added
- ...

### Changed  
- ...

### Fixed
- Bug BUG-NNN: <description>
```

## When to Split a File
Split a wiki file when:
- It exceeds 200 lines
- It contains more than 3 unrelated sections
- A section is referenced from multiple other files

## VitePress Quick Setup
```bash
cd wiki
npm init -y
npm install -D vitepress
# Add to wiki/package.json scripts:
# "docs:dev": "vitepress dev ."
# "docs:build": "vitepress build ."
```

Config file: `wiki/.vitepress/config.ts`
```typescript
export default {
  title: 'TM Scheduler Wiki',
  description: 'ToastMasters Scheduling Application',
  themeConfig: {
    sidebar: [
      { text: 'Plan', link: '/plan/roadmap' },
      { text: 'Features', link: '/features/' },
      { text: 'Tech Stack', link: '/techstack/' },
      { text: 'Business Workflow', link: '/business-workflow/' },
    ],
  },
};
```
