# Online Session Business Rules

## Overview
Online ToastMasters sessions connect members virtually for speech practice.

## Schedule
- **Frequency**: Once per week
- **Day**: Wednesday
- **Time**: 11:20 (Vietnam time)

## Session Roles

| Role | Count | Description |
|------|-------|-------------|
| Main Chairman | 1 | Hosts and leads the entire online session; corrects pronunciation |
| Sub Chairman | 1 | Supports the main chairman; fills in if needed |
| Speaker | 2 | Delivers a prepared conversation / speech topic |

## Eligibility Rules

### Speakers
- Must be `status = Active`
- Must have `project_level < 10`
- Suggestion order: fewest speech count first (fair rotation)

### Chairmen (Main and Sub)
- Must be `status = Active`
- No project_level restriction
- Suggestion order: fewest chairman count first

## Chairman Rotation Constraint
The **main chairman** role has an additional constraint:
- A member who was main chairman in week N **must NOT** be main chairman in week N+1 or week N+2
- Pattern: `A → B → C → A → ...` (spacing of at least 2 sessions)
- Sub chairman has no such restriction

## Auto-Suggest Logic
```
1. Get all Active members sorted by chairman_count ASC
2. Exclude members who were main chairman in the last 2 sessions
3. Suggest #1 as main chairman, #2 as sub chairman
4. Get all Active members with project_level < 10, sorted by speech_count ASC
5. Suggest top 2 as speakers
6. Check for duplicates (a person cannot be chairman AND speaker in same session)
```

## Session Display (Timetable)
Each session column shows:
```
Chairman: Alice (Main) / Bob (Sub)
Speaker 1: Charlie
Speaker 2: Diana
```

## Notes
- Sessions can have free-form `notes` attached to a date
- If a session has to be skipped, it can be marked as cancelled
