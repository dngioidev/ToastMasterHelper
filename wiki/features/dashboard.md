# Feature: Dashboard & Analytics
**Status**: 📋 Planned
**Priority**: High
**Phase**: 5
**Owner**: Product Owner

## Problem Statement
Organisers need an at-a-glance view of the club's health: who has participated, how many times each member has taken each role, and what the upcoming schedule looks like.

## User Stories
- As a club organiser, I want to see a summary of each member's participation so that I can identify who hasn't had recent opportunities
- As a club organiser, I want to see the next upcoming session details on the dashboard so that I can quickly confirm the schedule
- As a club organiser, I want to see role count stats per member so that I can verify the rotation is fair

## Acceptance Criteria
- [ ] AC1: Dashboard shows upcoming session date and assigned roles if already planned
- [ ] AC2: Member participation table shows: name, status, project_level, last speech date, role counts
- [ ] AC3: Data loads in < 2 seconds on a standard connection
- [ ] AC4: Dashboard is usable on mobile (375px+ width)

## Out of Scope (v1)
- Historical trend graphs
- Per-member detailed drill-down page
- Export to PDF/CSV

## Design Decisions
| Decision | Chosen | Reason |
|----------|--------|--------|
| Dashboard layout | Summary KPIs at top, table below | Prioritises quick info scan |
| Role count display | Compact number grid per member row | Density required for many roles |

## Technical Notes
- API: `GET /dashboard/summary` — aggregated stats in one call
- No new tables needed — data derived from members + sessions
