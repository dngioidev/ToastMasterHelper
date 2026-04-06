---
name: designer-uxui
description: "Use when: designing UI components, creating wireframes, choosing colors and typography, accessibility review, UX flow design, design system decisions, component layout, responsive design, visual hierarchy, TailwindCSS design tokens, user interaction patterns"
argument-hint: "Describe the design task (e.g., 'design session schedule table layout')"
---
# Designer UX/UI Skill

Senior UX/UI design patterns for the TM Scheduler interface.

## When to Use
- Planning the layout of a new UI feature
- Defining design system tokens (colours, spacing, type)
- Running an accessibility review
- Creating wireframes for approval before implementation
- Making component-level UI decisions

## Procedure
1. **Read requirements** — `wiki/features/<feature>.md` acceptance criteria
2. **Check existing design** — review related components for consistency
3. **Wireframe** — ASCII/markdown wireframe in the wiki
4. **Design tokens** — define or reuse TailwindCSS tokens
5. **Accessibility check** — run against WCAG 2.1 AA checklist
6. **Record decision** — add `## Design Decisions` table to feature wiki
7. **Brief frontend** — note component breakdown for engineer

## Reference Files
- [UX/UI Rules and Patterns](./references/uxui-rules.md)
- [Design System Tokens](./references/design-tokens.md)

## TM Scheduler Design Language
- **Primary**: indigo (`#4F46E5`) — brand action colour
- **Success**: emerald (`#10B981`) — passed, active
- **Warning**: amber (`#F59E0B`) — pending, leave status
- **Danger**: red (`#EF4444`) — missing role, error
- **Neutral**: gray scale for text, borders, backgrounds
- **Font**: system-ui / Inter — legible at small sizes
- **Border radius**: `rounded-lg` (8px) for cards, `rounded` (4px) for inputs

## Wireframe Format
```
┌─ Component name ──────────────────┐
│ Content description               │
│ [Action Button]   [Secondary]     │
└───────────────────────────────────┘
```

## Accessibility Checklist
- [ ] Colour contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text
- [ ] Tap targets ≥ 44×44px
- [ ] All inputs have `<label>` associations
- [ ] Icon-only buttons have `aria-label`
- [ ] Focus visible on all interactive elements
- [ ] No information conveyed by colour alone
- [ ] Keyboard navigable (Tab, Enter, Escape, Arrow keys)

## Schedule Table UX Rules
- Sticky first column (role names) when scrolling horizontally
- Sticky header row (dates) when scrolling vertically
- Compact row height (40px) — density is required for multi-session view
- Empty cells show `—` with `text-gray-300`
- Level badge: `(P3)` shown as small chip next to speaker name
- `Passed` badge: emerald chip

## Mobile Constraints
- Schedule table: horizontal scroll (no column collapse)
- Minimum readable column width: 80px
- Bottom-sheet pattern for mobile forms (full-width modal)
- FAB (`+`) for primary create action on mobile
