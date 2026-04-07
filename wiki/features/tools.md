# Tools — Export & Backup

## Summary
The Tools page (`/tools`) provides data export and backup/restore functionality for admin users.

---

## Feature 1: Export Sessions by Date Range

### User Story
As an admin, I want to export session schedules within a specific date range so I can share or archive them in Excel.

### API
```
GET /api/v1/export/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD
→ application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### Excel Output
Two sheets:
- **Online Sessions**: Date, Main Chairman, Sub Chairman, Speaker 1, Speaker 2, Notes
- **Offline Sessions**: Date, Cancelled, Toast Master, Table Tonic, Speaker 1/2, Evaluator 1/2, Topic Master, Uh-Ah Counter, Timer, General Evaluator, Backup Speaker 1/2, Notes

---

## Feature 2: Full System Export

### User Story
As an admin, I want to export all system data to a single Excel file for reporting.

### API
```
GET /api/v1/export/full
→ application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### Excel Output — 4 sheets
| Sheet | Contents |
|-------|----------|
| Members | Name, Status, Project Level, attendance flags |
| Online Sessions | All online sessions with member names |
| Offline Sessions | All offline sessions with all role assignments |
| Member Analytics | Role count breakdown per member |

---

## Feature 3: Backup & Restore

### User Story
As an admin, I want to download a full backup of all data and be able to restore it, so I can recover from mistakes or migrate environments.

### Backup API
```
GET /api/v1/backup/download
→ application/json (attachment)
```

**Backup format:**
```json
{
  "version": "1.0",
  "exported_at": "2026-04-07T12:00:00.000Z",
  "data": {
    "members": [...],
    "online_sessions": [...],
    "offline_sessions": [...],
    "offline_session_assignments": [...]
  }
}
```

### Restore API
```
POST /api/v1/backup/restore
Body: <full backup JSON object>
→ { "data": { "restored": <number of records> } }
```

**Restore behaviour:**
- Runs inside a database transaction
- Deletes all existing data in FK-safe order
- Re-inserts all records from the backup
- Rolls back fully if any insertion fails

**Safety:**
- Frontend shows a confirmation dialog before submitting
- Warning text clearly states destruction of current data
- Transaction guarantees atomic restore — no partial state

---

## Technical Notes
- Backend: `ExportModule` (`/modules/export/`) uses `exceljs`
- Backend: `BackupModule` (`/modules/backup/`) uses TypeORM `DataSource` query runner for transactions
- Frontend: `/tools` page with three sections; file downloads use `axios` blob + `URL.createObjectURL`
- Both modules are protected by the global JWT guard
