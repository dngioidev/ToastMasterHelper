# UX/UI Rules and Patterns

## Core Principles
1. **Clarity**: The primary job is information access — schedule tables must be instantly scannable
2. **Density**: Show more with less — compact rows, contextual details on hover/click
3. **Consistency**: Every interactive element behaves the same way everywhere
4. **Feedback**: All async actions show loading → success/error states

## Component Patterns

### Status Badges
```
Active → green pill:  [Active]
Leave  → gray pill:   [Leave]
Passed → emerald chip: [Passed]
Level  → blue chip:   [Lv.5]
```

### Action Buttons
- Primary action: filled brand button (indigo)
- Secondary action: outlined button
- Destructive action: red button (appears only in confirmation modal, never inline)
- Icon buttons: always include `aria-label`

### Empty States
Every list/table must have an empty state:
```
┌──────────────────────────────────┐
│      No sessions scheduled       │
│  [+ Create First Session]        │
└──────────────────────────────────┘
```

### Loading States
Use skeleton loaders (not spinners) for table/list content:
- Skeleton rows maintain the same height as real rows
- Loading indicator on action buttons (spinner inside button, disable during request)

### Error States
- Form validation: red inline error below each field with `role="alert"`
- API errors: toast notification (top-right, auto-dismiss 5s)
- Blocking errors: inline error card with retry button

## Layout Templates

### Page Layout
```
┌─ Sidebar nav ─────┬─ Main content ─────────────────────┐
│ TM Scheduler      │ [Page title]          [Page action] │
│ ─────────────     │ ─────────────────────────────────── │
│ Dashboard         │ [Content area]                      │
│ Online Sessions   │                                     │
│ Offline Sessions  │                                     │
│ Members           │                                     │
└───────────────────┴─────────────────────────────────────┘
```
On mobile: sidebar collapses to bottom tab bar (4 tabs max).

### Schedule Table
```
┌─ Sticky col ─┬─── Sticky header ────────────────────────┐
│ Role         │ Apr 7       │ Apr 14      │ Apr 21        │
├──────────────┼─────────────┼─────────────┼───────────────┤
│ Main Chairman│ Alice       │ Bob         │ Carol         │
│ Sub Chairman │ Bob         │ Carol       │ Alice         │
│ Speaker 1    │ Dave(P3)    │ Eve(P1)     │ Frank(P5)     │
│ Speaker 2    │ Grace(P2)   │ Henry(P4)   │ Ivan(P1) ✅   │
└──────────────┴─────────────┴─────────────┴───────────────┘
```

### Member Card (List View)
```
┌────────────────────────────┐
│ Alice        [Active] Lv.5 │
│ Speeches: 5  Chairman: 3   │
│ Last speech: Mar 29, 2026  │
│                    [Edit]  │
└────────────────────────────┘
```

## Responsive Breakpoints
| Breakpoint | Width | Layout change |
|-----------|-------|---------------|
| xs (mobile) | 375px | Single column, bottom tabs |
| sm | 640px | Slightly wider single column |
| md (tablet) | 768px | Sidebar appears |
| lg (desktop) | 1024px | Full layout |
| xl | 1280px | Wider content area |
