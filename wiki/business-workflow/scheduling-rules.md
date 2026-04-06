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

## No Eligible Candidates
If no eligible candidates exist for a role (e.g. all Active members are level 10 for speaker):
- Return an empty suggestions list with an error message
- Example: "No eligible speakers found — all active members have completed their speaker track"
