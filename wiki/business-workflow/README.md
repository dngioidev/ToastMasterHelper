# Business Workflow — Overview

This section defines the ToastMasters domain rules that govern all scheduling logic in TM Scheduler.

> **All agents must read the relevant workflow file before implementing scheduling features.**

## Session Types

| Type | Frequency | File |
|------|-----------|------|
| Online Session | Weekly, Wednesday 11:20 | [online-session.md](./online-session.md) |
| Offline Session | Structured club meetings | [offline-session.md](./offline-session.md) |

## Core Domain Concepts

### Members
- Each member has a **status**: `Active` or `Leave`
- Only **Active** members are eligible for any role
- Each member has a **project_level** (0–10) tracking speaking progression
- Each member has **role_counts** — tallying times in each role (drives fair rotation)

### Project Level Rules
| Level | Meaning |
|-------|---------|
| 0–9 | Eligible speaker |
| 10 | Completed speaker track — can only do non-speaker roles |
| > speaker's level | Required to be evaluator for that speaker |

### Fair Rotation Principle
- For every role, the **least-assigned** eligible member is suggested first
- This ensures equitable participation over time
- See full algorithm in [scheduling-rules.md](./scheduling-rules.md)

## Quick Reference

| Rule | Constraint |
|------|-----------|
| Speaker eligibility | `status = Active AND project_level < 10` |
| Evaluator eligibility | `status = Active AND project_level > paired_speaker.project_level` |
| All other roles | `status = Active` |
| Role rotation | Least `role_count` first |
| Duplicate in session | Same member in 2+ roles = warning |
| Level increment | Speaker marked Passed → `project_level += 1` (max 10) |
