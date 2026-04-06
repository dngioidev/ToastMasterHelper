# Feature: Offline Session Scheduling
**Status**: 📋 Planned
**Priority**: High
**Phase**: 4
**Owner**: Product Owner

## Problem Statement
Offline TM sessions have a structured role matrix (10+ roles) with specific eligibility rules. Manually assigning roles while respecting project-level gates and maintaining fair rotation is time-consuming and error-prone.

## User Stories
- As a club organiser, I want to create an offline session with all roles assigned so that the meeting is fully planned
- As a club organiser, I want the system to enforce that evaluators have a higher project level than speakers so that the evaluation quality standard is maintained
- As a club organiser, I want the system to suggest all roles fairly so that every member gets equal participation over time
- As a club organiser, I want to mark a speaker as Passed so that their project level automatically increments
- As a club organiser, I want to assign backup speakers so that there is always a fallback if a speaker cancels

## Acceptance Criteria
- [ ] AC1: Given a session is created, Then it supports all defined roles (Toast Master, Table Tonic, Speaker 1–N, Evaluator 1–N, Topic Master, Uh/Ah Counter, Timer, GE, Backup Speakers)
- [ ] AC2: Given an evaluator is suggested, Then their project_level must be STRICTLY greater than their paired speaker's project_level
- [ ] AC3: Given auto-suggest runs for evaluators, Then the eligible evaluator with the fewest evaluations is suggested first
- [ ] AC4: Given a speaker is marked Passed, When saved, Then that speaker's project_level increments by 1 (max 10)
- [ ] AC5: Given a member is assigned a role, Then they cannot be assigned any other role in the same session (warning shown on duplicate)
- [ ] AC6: Given num_speakers = 3 is configured, Then 3 speaker+evaluator pairs are supported per session

## Business Rules Applied
- See `wiki/business-workflow/offline-session.md`
- See `wiki/business-workflow/scheduling-rules.md`
- Evaluator must have `project_level > speaker.project_level` (STRICTLY greater)
- Speaker eligible: `project_level < 10 AND status = Active`
- All non-speaker roles: `status = Active` only
- Fair rotation: least-role-count first for each role independently

## Out of Scope (v1)
- Session agenda export as PDF
- Video recording link attachment
- Complex role substitution tracking

## Design Decisions
| Decision | Chosen | Reason |
|----------|--------|--------|
| Speaker display | `Speaker 1 (P3)` | Shows project stage next to speaker name |
| Passed indicator | ✅ green chip | Immediately visible in timetable |
| Role assignment form | Inline dropdowns in table | Efficient for organisers |

## Technical Notes
- Entity: `offline_sessions` with configurable `num_speakers`
- Separate join table `session_role_assignments` (session_id, role, member_id)
- Separate table `session_speakers` (session_id, speaker_id, evaluator_id, passed flag)
- Config table for `num_speakers`, `num_backup_speakers`
- All assignments validated at save time (level gate, duplicate check)
