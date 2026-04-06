# Feature: Member Management
**Status**: 📋 Planned
**Priority**: High
**Phase**: 2
**Owner**: Product Owner

## Problem Statement
ToastMasters clubs need to track member identities, their activity status (Active/Leave), and speaking progression (project level 0–10) to correctly enforce scheduling rules and provide fair role opportunities.

## User Stories
- As a club organiser, I want to add new members so that I can include them in scheduling
- As a club organiser, I want to set a member's status to Leave so that they are excluded from scheduling while absent
- As a club organiser, I want to view a member's project level and role history so that I can understand their participation
- As the system, I want to automatically increment a member's project level when they are marked as having passed a speech

## Acceptance Criteria
- [ ] AC1: Given a valid member DTO, When POST /members, Then member is created and returned with a UUID
- [ ] AC2: Given a member exists, When PATCH /members/:id, Then the member is updated
- [ ] AC3: Given a member is on Leave, When auto-suggest runs, Then that member is NOT suggested for any role
- [ ] AC4: Given a speaker is marked Passed, When the session is saved, Then their project_level increments by 1
- [ ] AC5: Given a member reaches project_level 10, When auto-suggest runs for speakers, Then that member is excluded
- [ ] AC6: Given GET /members, Then paginated list returned with status and project_level for each member

## Business Rules Applied
- `status: Active` required for any role assignment
- `project_level` range: 0–10; automatically capped at 10

## Out of Scope (v1)
- Member profile photos
- Contact details / email
- Detailed attendance history view

## Design Decisions
| Decision | Chosen | Reason |
|----------|--------|--------|
| Member list layout | Card grid (desktop), list (mobile) | Density + readability |
| Status indicator | Coloured pill badge | Scannable at a glance |
| Project level display | Numeric badge `Lv.X` | Compact, clear |

## Technical Notes
- Entity: `members` table with `status` enum and `project_level` integer
- Migration required on creation
- Role counts stored as JSONB column on `members` table: `{ "chairman": 3, "speaker": 2, ... }`
- API: `GET /members`, `POST /members`, `PATCH /members/:id`, `DELETE /members/:id`
