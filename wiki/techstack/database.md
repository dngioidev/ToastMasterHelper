# Database Tech Stack

## Engine
PostgreSQL 16 (via `postgres:16-alpine` Docker image)

## ORM
TypeORM 0.3 with TypeScript decorators

## Entity Relationship Overview

```
members
├── id (uuid PK)
├── name (varchar)
├── status (enum: Active | Leave)
├── project_level (int 0-10)
├── role_counts (jsonb) -- { chairman: 0, speaker: 0, evaluator: 0, ... }
└── created_at (timestamp)

online_sessions
├── id (uuid PK)
├── date (date, unique)
├── main_chairman_id (FK → members)
├── sub_chairman_id (FK → members)
├── speaker1_id (FK → members)
├── speaker2_id (FK → members)
└── created_at (timestamp)

offline_sessions
├── id (uuid PK)
├── date (date)
├── notes (text, nullable)
└── created_at (timestamp)

session_role_assignments  -- For offline sessions, non-speaker roles
├── id (uuid PK)
├── session_id (FK → offline_sessions)
├── role (enum: toast_master | table_tonic | topic_master | uh_ah_counter | timer | general_evaluator)
└── member_id (FK → members)

session_speakers  -- Speaker + evaluator pairs, offline sessions
├── id (uuid PK)
├── session_id (FK → offline_sessions)
├── speaker_id (FK → members)
├── evaluator_id (FK → members)
├── slot_number (int)  -- 1, 2, 3...
└── passed (boolean, default false)

session_backup_speakers
├── id (uuid PK)
├── session_id (FK → offline_sessions)
└── member_id (FK → members)

session_notes
├── id (uuid PK)
├── date (date)
├── content (text)
└── member_ids (uuid[], nullable)  -- optional member tags
```

## Migration Strategy
- All schema changes → generate a TypeORM migration file
- Migrations run on container startup via `scripts/migrate.sh`
- Never use `synchronize: true` in staging/production
- Migration file naming: `YYYYMMDDHHMMSS-DescribeChange.ts`

## Key Indexes
- `members.status` — filtered queries for eligible members
- `online_sessions.date` — sorted display
- `offline_sessions.date` — sorted display

## Backups
- Daily PostgreSQL dump via `scripts/backup-db.sh`
- Store dumps outside the container volume
