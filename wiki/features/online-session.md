# Feature: Online Session Scheduling
**Status**: 📋 Planned
**Priority**: High
**Phase**: 3
**Owner**: Product Owner

## Problem Statement
The club holds weekly online sessions every Wednesday at 11:20. Scheduling 2 speakers and 2 chairmen fairly — ensuring no one repeats too frequently and the rotation is equitable — is currently a manual, error-prone process.

## User Stories
- As a club organiser, I want to create an online session for a specific date so that the meeting is tracked
- As a club organiser, I want the system to auto-suggest speaker and chairman assignments so that I save time and ensure fairness
- As a club organiser, I want to view a timetable of all online sessions so that I can see the full schedule at a glance
- As a club organiser, I want to override auto-suggestions so that I can accommodate special requests
- As a member, I want to see when I am scheduled to speak so that I can prepare

## Acceptance Criteria
- [ ] AC1: Given a date is provided, When POST /sessions/online, Then a session is created for that date
- [ ] AC2: Given auto-suggest is triggered, Then 2 eligible speakers (Active, level < 10, fewest speeches first) are suggested
- [ ] AC3: Given auto-suggest is triggered, Then 1 main + 1 sub chairman are suggested (fewest chairman assignments first)
- [ ] AC4: Given the same member was main chairman in the previous session, Then they must NOT be suggested as main chairman for the next or the one after (no repeat within 2 adjacent sessions)
- [ ] AC5: Given a timetable view is requested, Then a matrix of role × session-date is returned
- [ ] AC6: Given a member is on Leave, Then they do not appear in any auto-suggestion

## Business Rules Applied
- See `wiki/business-workflow/online-session.md` for full rules
- Speaker eligibility: `status = Active AND project_level < 10`
- Chairman rotation: no repeat main chairman within 2 consecutive weeks
- Fair rotation: least-assigned member suggested first (by role count)

## Out of Scope (v1)
- Email/notification to assigned members
- Session cancellation flow
- Multiple session types on the same date

## Design Decisions
| Decision | Chosen | Reason |
|----------|--------|--------|
| Timetable orientation | Rows = Roles, Columns = Dates | Matches how organisers read the schedule |
| Auto-suggest trigger | Manual button click | Prevents unintended override of existing assignments |
| Override indicator | Yellow highlight on manually changed cells | Clear audit trail |

## Technical Notes
- Entity: `online_sessions` with date, speaker1_id, speaker2_id, main_chairman_id, sub_chairman_id
- `role_counts` JSONB on member updated when session saved
- Endpoint: `GET /sessions/online/suggest?date=YYYY-MM-DD` → returns suggested assignments
- Migration: `online_sessions` table
