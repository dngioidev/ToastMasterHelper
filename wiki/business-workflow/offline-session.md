# Offline Session Business Rules

## Overview
Offline ToastMasters sessions are structured in-person meetings where members practice public speaking and leadership through fixed rotating roles.

## Session Roles

| Role | Time | Count | Description |
|------|------|-------|-------------|
| Toast Master | 2 min | 1 | Emcee of the entire session |
| Table Tonic | — | 1 | Opening/warmup segment leader |
| Speaker 1, 2… | 10 min each | N (configurable) | Prepared speech presenters |
| Evaluator (per speaker) | 3 min each | N | Evaluates a specific speaker |
| Topic Master | 15 min | 1 | Leads improvised speaking segment |
| Table Topic | — | Variable | Participant in the improvised segment |
| Uh/Ah Counter | 1 min | 1 | Tracks filler words |
| Timer | 1 min | 1 | Tracks time for all speakers |
| General Evaluator (GE) | 5 min | 1 | Evaluates overall session quality |
| Backup Speakers | — | Configurable | Standby speakers if a scheduled speaker cancels |

## Member Eligibility

### Speakers
- `status = Active`
- `project_level < 10`
- Timetable shows: `Speaker Name (P{level+1})` — indicates their current project stage

### Evaluators
- `status = Active`
- `project_level > paired_speaker.project_level` **(STRICTLY greater — equal level is NOT allowed)**
- Each evaluator is paired 1:1 with a specific speaker

### All Other Roles
- `status = Active`
- No project_level restriction

### Backup Speakers
- Same eligibility as speakers: `status = Active AND project_level < 10`

## Speaker Progression (Passed Flag)
- When an assigned speaker delivers their speech and is marked **Passed**, their `project_level` increments by `+1`
- Maximum level is 10 — capped there
- The session timetable displays `(Passed)` next to the speaker's name when they passed

## Session Configuration
The club can configure:
- `num_speakers` — number of speaker+evaluator pairs per session (default: 2)
- `num_backup_speakers` — number of backup speaker slots (default: 1)

## Auto-Suggest Rules (All Roles)
For each role independently:
1. Get all `Active` members
2. Filter by any eligibility constraint (level gate for speakers/evaluators)
3. Sort by that role's count ascending
4. Suggest the top candidate(s)
5. Skip members already assigned a role in this session (show warning if duplicate)

## Session Display (Timetable)
Rows = Roles, Columns = Session Dates

```
| Role           | Mar 15     | Mar 29     |
|----------------|------------|------------|
| Toast Master   | Alice      | Bob        |
| Speaker 1      | Charlie(P3)| Eve(P1)    |
| Evaluator 1    | Diana      | Frank      |
| Speaker 2      | Grace(P5)  | Henry(P2)  |
| Evaluator 2    | Ivan       | Julia      |
| Timer          | Kate       | Liam       |
| Uh/Ah Counter  | Mike       | Nancy      |
| GE             | Oscar      | Pam        |
```

## Notes and Events
- Free-form notes can be attached to a session date
- Notes can optionally tag one or more members (e.g. for absences, announcements)
