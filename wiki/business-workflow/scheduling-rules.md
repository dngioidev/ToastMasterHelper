# Scheduling Rules — Auto-Suggest Algorithm

## Principle: Fair Rotation
The core scheduling philosophy is **fairness**: every eligible member should get equal opportunity for each role over time.

This is enforced by:
1. Using **role_counts** — a per-member tally of how many times they've been in each role
2. Always suggesting the member with the **lowest count for that specific role** first

## General Algorithm (Any Role)
```
FUNCTION suggestForRole(role, sessionDate):
  1. Get all members where status = Active
  2. Apply role-specific eligibility filter (if any)
  3. Exclude members already assigned a role in this session
  4. Sort by role_counts[role] ASC, then by name ASC (tie-breaker)
  5. Return top N candidates (N depends on how many slots the role has)
```

## Role-Specific Rules

### Speakers (Offline)
```
Eligibility: status = Active AND project_level < 10
Sort key: role_counts['speaker'] ASC
```

### Evaluators (Offline)
```
For each speaker slot:
  Eligibility: status = Active AND project_level > speaker.project_level
  Sort key: role_counts['evaluator'] ASC
```

### Main Chairman (Online)
```
Eligibility: status = Active
Additional: NOT been main_chairman in the 2 most recent online sessions
Sort key: role_counts['main_chairman'] ASC
```

### Sub Chairman (Online)
```
Eligibility: status = Active
Additional: NOT already suggested as main_chairman this session
Sort key: role_counts['sub_chairman'] ASC
```

### All Other Roles (Toast Master, Timer, GE, etc.)
```
Eligibility: status = Active
Sort key: role_counts['<role>'] ASC
```

### Backup Speakers (Offline)
```
Eligibility: status = Active AND project_level < 10
Additional: NOT already assigned as a primary speaker this session
Sort key: role_counts['backup_speaker'] ASC
```

## Role Count Updates
Role counts are updated ONLY when a session is **saved/confirmed** (not on auto-suggest preview):
- Increment `member.role_counts[role]` by 1 for each confirmed assignment
- For speakers: increment `role_counts['speaker']` by 1
- If speaker marked **Passed**: additionally increment `project_level` by 1 (max 10)

## Duplicate Warning
If during manual assignment a member is assigned more than one role in the same session:
- Show a **warning** but do NOT block the save
- Warning text: "Member [Name] is assigned to [Role A] and [Role B] in the same session"
- Auto-suggest NEVER creates duplicates — it excludes already-assigned members

## 2-Week Nearby Exclusion Rule

Auto-suggest enforces a **14-day window exclusion** for speaker-type and evaluator roles to prevent the same member from appearing in the same role in back-to-back nearby sessions.

### Speaker-type group
The following roles are treated as a **single speaker group** for exclusion purposes:
- `speaker` (offline)
- `backup_speaker` (offline)
- `speaker1` / `speaker2` (online)

A member who appeared in **any** of these roles in any session within `[date − 14 days, date + 14 days]` will be excluded from all speaker-type slots in the suggested session.

### Evaluator group
- `evaluator` (offline only)

A member who was an evaluator in any offline session within `[date − 14 days, date + 14 days]` will be excluded from evaluator slots in the suggested session.

### Roles NOT affected by the 2-week rule
Toast Master, Table Tonic, Topic Master, Uh-Ah Counter, Timer, General Evaluator, Main Chairman, Sub Chairman — these roles use the standard fair-rotation algorithm only (no recency window).

### Algorithm extension
```
windowStart = date − 14 days
windowEnd   = date + 14 days

recentSpeakerIds =
  offline assignments WHERE role IN ('speaker','backup_speaker')
    AND session.date BETWEEN windowStart AND windowEnd
  UNION
  online sessions WHERE date BETWEEN windowStart AND windowEnd
    → collect speaker1_id and speaker2_id

recentEvaluatorIds =
  offline assignments WHERE role = 'evaluator'
    AND session.date BETWEEN windowStart AND windowEnd

// Applied in filters during suggest:
Speaker eligibility += NOT IN recentSpeakerIds
Backup speaker eligibility += NOT IN recentSpeakerIds
Evaluator eligibility += NOT IN recentEvaluatorIds
```

> **Note:** Auto-suggest falls back to any eligible member if the exclusion window empties the candidate pool (e.g. very small club with few eligible speakers).

## No Eligible Candidates
If no eligible candidates exist for a role (e.g. all Active members are level 10 for speaker):
- Return an empty suggestions list with an error message
- Example: "No eligible speakers found — all active members have completed their speaker track"
