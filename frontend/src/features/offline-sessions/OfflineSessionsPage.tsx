import { useState, Fragment, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  useOfflineSessions,
  useCreateOfflineSession,
  useUpdateOfflineSession,
  useDeleteOfflineSession,
  useOfflineSessionSuggest,
} from './useOfflineSessions';
import { useMembers } from '../members/useMembers';
import { OfflineRole } from './offlineSession.types';
import type {
  OfflineSession,
  OfflineSessionAssignment,
} from './offlineSession.types';

// ─── Timetable helpers ────────────────────────────────────────────────────────

const ROLE_TIME: Partial<Record<OfflineRole, string>> = {
  [OfflineRole.TOAST_MASTER]: '2',
  [OfflineRole.TABLE_TONIC]: '—',
  [OfflineRole.SPEAKER]: '10',
  [OfflineRole.EVALUATOR]: '3',
  [OfflineRole.TOPIC_MASTER]: '15',
  [OfflineRole.UH_AH_COUNTER]: '1',
  [OfflineRole.TIMER]: '1',
  [OfflineRole.GENERAL_EVALUATOR]: '5',
  [OfflineRole.BACKUP_SPEAKER]: '—',
};

interface RowDef {
  no: number | null;
  label: string;
  role: OfflineRole;
  slot: number;
  isBackup: boolean;
}

function buildRows(maxSpeakers: number, maxBackup: number): RowDef[] {
  const rows: RowDef[] = [];
  let no = 1;
  rows.push({ no: no++, label: 'Toast Master', role: OfflineRole.TOAST_MASTER, slot: 0, isBackup: false });
  rows.push({ no: no++, label: 'Table Tonic', role: OfflineRole.TABLE_TONIC, slot: 0, isBackup: false });
  for (let i = 0; i < maxSpeakers; i++) {
    rows.push({ no: no++, label: `Speaker ${i + 1}`, role: OfflineRole.SPEAKER, slot: i, isBackup: false });
    rows.push({ no: no++, label: `Evaluator ${i + 1}`, role: OfflineRole.EVALUATOR, slot: i, isBackup: false });
  }
  rows.push({ no: no++, label: 'Topic Master', role: OfflineRole.TOPIC_MASTER, slot: 0, isBackup: false });
  rows.push({ no: no++, label: 'Uh/Ah Counter', role: OfflineRole.UH_AH_COUNTER, slot: 0, isBackup: false });
  rows.push({ no: no++, label: 'Timer', role: OfflineRole.TIMER, slot: 0, isBackup: false });
  rows.push({ no: no++, label: 'GE', role: OfflineRole.GENERAL_EVALUATOR, slot: 0, isBackup: false });
  for (let i = 0; i < maxBackup; i++) {
    rows.push({ no: null, label: 'Backup Speaker', role: OfflineRole.BACKUP_SPEAKER, slot: i, isBackup: true });
  }
  return rows;
}

function getAssignment(
  session: OfflineSession,
  role: OfflineRole,
  slot: number,
): OfflineSessionAssignment | null {
  return session.assignments.find((a) => a.role === role && a.slot_index === slot) ?? null;
}

function CellContent({
  assignment,
  role,
}: {
  assignment: OfflineSessionAssignment | null;
  role: OfflineRole;
}) {
  if (!assignment?.member) return <span className="text-gray-400">—</span>;
  const { name, project_level } = assignment.member;
  if (role === OfflineRole.SPEAKER || role === OfflineRole.BACKUP_SPEAKER) {
    return (
      <span>
        {name}{' '}
        <span className="text-blue-600 font-medium">(P{(project_level ?? 0) + 1})</span>
        {assignment.passed && (
          <span className="text-green-600 ml-1">(Passed)</span>
        )}
      </span>
    );
  }
  return <span>{name}</span>;
}

// ─── Shared member select ─────────────────────────────────────────────────────

function MemberSelect({
  id,
  value,
  onChange,
  members,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  members: { id: string; name: string }[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      <option value="">— Unassigned —</option>
      {members.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}

// ─── Offline session form (create + edit) ────────────────────────────────────

interface OfflineSessionFormProps {
  session?: OfflineSession;
  onClose: () => void;
}

function OfflineSessionForm({ session, onClose }: OfflineSessionFormProps) {
  const isEdit = session !== undefined;

  const [date, setDate] = useState(
    session?.date ?? dayjs().add(1, 'week').format('YYYY-MM-DD'),
  );
  const [numSpeakers, setNumSpeakers] = useState(session?.num_speakers ?? 2);
  const [numBackup, setNumBackup] = useState(session?.num_backup_speakers ?? 1);
  const [isCancelled, setIsCancelled] = useState(session?.is_cancelled ?? false);
  const [suggestCount, setSuggestCount] = useState(0);

  // role:slot → member_id
  const [roleMap, setRoleMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    session?.assignments.forEach((a) => {
      map[`${a.role}:${a.slot_index}`] = a.member_id ?? '';
    });
    return map;
  });

  // role:slot → passed
  const [passedMap, setPassedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    session?.assignments.forEach((a) => {
      map[`${a.role}:${a.slot_index}`] = a.passed;
    });
    return map;
  });

  const { data: membersPage } = useMembers();
  const members = membersPage?.data ?? [];

  const { data: suggestion, isLoading: isSuggesting } = useOfflineSessionSuggest(
    numSpeakers,
    numBackup,
    suggestCount,
  );

  const createSession = useCreateOfflineSession();
  const updateSession = useUpdateOfflineSession();
  const isPending = createSession.isPending || updateSession.isPending;

  // Apply suggestion into roleMap whenever a new suggestion arrives
  useEffect(() => {
    if (!suggestion) return;
    const newMap: Record<string, string> = {};
    if (suggestion.toast_master) newMap[`${OfflineRole.TOAST_MASTER}:0`] = suggestion.toast_master.id;
    if (suggestion.table_tonic) newMap[`${OfflineRole.TABLE_TONIC}:0`] = suggestion.table_tonic.id;
    suggestion.speakers.forEach((s, i) => { if (s) newMap[`${OfflineRole.SPEAKER}:${i}`] = s.id; });
    suggestion.evaluators.forEach((e, i) => { if (e) newMap[`${OfflineRole.EVALUATOR}:${i}`] = e.id; });
    if (suggestion.topic_master) newMap[`${OfflineRole.TOPIC_MASTER}:0`] = suggestion.topic_master.id;
    if (suggestion.uh_ah_counter) newMap[`${OfflineRole.UH_AH_COUNTER}:0`] = suggestion.uh_ah_counter.id;
    if (suggestion.timer) newMap[`${OfflineRole.TIMER}:0`] = suggestion.timer.id;
    if (suggestion.general_evaluator) newMap[`${OfflineRole.GENERAL_EVALUATOR}:0`] = suggestion.general_evaluator.id;
    suggestion.backup_speakers.forEach((b, i) => { if (b) newMap[`${OfflineRole.BACKUP_SPEAKER}:${i}`] = b.id; });
    setRoleMap(newMap);
  }, [suggestion]);

  const setRole = (role: OfflineRole, slot: number, memberId: string) => {
    setRoleMap((prev) => ({ ...prev, [`${role}:${slot}`]: memberId }));
  };

  const setPassed = (role: OfflineRole, slot: number, value: boolean) => {
    setPassedMap((prev) => ({ ...prev, [`${role}:${slot}`]: value }));
  };

  const handleSave = () => {
    const assignments = Object.entries(roleMap)
      .filter(([, memberId]) => memberId !== '')
      .map(([key, memberId]) => {
        const colonIdx = key.indexOf(':');
        const role = key.substring(0, colonIdx) as OfflineRole;
        const slotIndex = parseInt(key.substring(colonIdx + 1), 10);
        return { member_id: memberId, role, slot_index: slotIndex, passed: passedMap[key] ?? false };
      });
    const payload = { date, num_speakers: numSpeakers, num_backup_speakers: numBackup, is_cancelled: isCancelled, assignments };
    if (isEdit) {
      updateSession.mutate({ id: session.id, payload }, { onSuccess: onClose });
    } else {
      createSession.mutate(payload, { onSuccess: onClose });
    }
  };

  // Build form rows using the same helper as the timetable
  const formRows = buildRows(numSpeakers, numBackup);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit offline session' : 'Create offline session'}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit Offline Session' : 'New Offline Session'}
        </h2>

        {/* Date + counts */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="offline-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              id="offline-date"
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setSuggestCount(0); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="num-speakers" className="block text-sm font-medium text-gray-700 mb-1">
              Speakers
            </label>
            <input
              id="num-speakers"
              type="number"
              min={1}
              max={5}
              value={numSpeakers}
              onChange={(e) => { setNumSpeakers(Number(e.target.value)); setSuggestCount(0); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="num-backup" className="block text-sm font-medium text-gray-700 mb-1">
              Backups
            </label>
            <input
              id="num-backup"
              type="number"
              min={0}
              max={3}
              value={numBackup}
              onChange={(e) => { setNumBackup(Number(e.target.value)); setSuggestCount(0); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Auto-suggest */}
        <button
          onClick={() => { setRoleMap({}); setSuggestCount((c) => c + 1); }}
          disabled={isSuggesting}
          className="w-full border border-blue-300 text-blue-600 rounded-lg py-2 text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          {isSuggesting ? 'Generating…' : '✨ Auto-Suggest Roles'}
        </button>

        {/* Role dropdowns */}
        {formRows.map((row, idx) => {
          const key = `${row.role}:${row.slot}`;
          const showSep = row.isBackup && !formRows[idx - 1]?.isBackup;
          return (
            <div key={key}>
              {showSep && (
                <div className="border-t-2 border-dashed border-gray-200 my-2" />
              )}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label htmlFor={`role-${key}`} className="block text-xs font-medium text-gray-500 mb-1">
                    {row.label}
                    {row.isBackup && <span className="ml-1 text-gray-400 italic">(backup)</span>}
                  </label>
                  <MemberSelect
                    id={`role-${key}`}
                    value={roleMap[key] ?? ''}
                    onChange={(v) => setRole(row.role, row.slot, v)}
                    members={members}
                  />
                </div>
                {(row.role === OfflineRole.SPEAKER || row.role === OfflineRole.BACKUP_SPEAKER) && (
                  <label className="flex items-center gap-1 text-xs text-gray-500 mt-4 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={passedMap[key] ?? false}
                      onChange={(e) => setPassed(row.role, row.slot, e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-green-500 focus:ring-green-400"
                    />
                    Passed
                  </label>
                )}
              </div>
            </div>
          );
        })}

        {/* Cancelled toggle */}
        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isCancelled}
              onChange={(e) => setIsCancelled(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-400"
            />
            Mark as Cancelled
          </label>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving…' : 'Save Session'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function OfflineSessionsPage() {
  const { data: sessions, isLoading, error } = useOfflineSessions();
  const deleteSession = useDeleteOfflineSession();
  const [showCreate, setShowCreate] = useState(false);
  const [editingSession, setEditingSession] = useState<OfflineSession | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this session?')) {
      deleteSession.mutate(id);
    }
  };

  const sortedSessions = [...(sessions ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const maxSpeakers = sortedSessions.length
    ? Math.max(...sortedSessions.map((s) => s.num_speakers))
    : 2;
  const maxBackup = sortedSessions.length
    ? Math.max(...sortedSessions.map((s) => s.num_backup_speakers))
    : 1;
  const rows = buildRows(maxSpeakers, maxBackup);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offline Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">
            In-person ToastMasters sessions
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Session
        </button>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Loading sessions…</p>}
      {error && (
        <p role="alert" className="text-red-600 text-sm">
          Failed to load sessions.
        </p>
      )}

      {!isLoading && !error && sortedSessions.length === 0 && (
        <p className="text-gray-400 text-sm py-8 text-center">
          No offline sessions yet. Create the first one!
        </p>
      )}

      {!isLoading && !error && sortedSessions.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-center px-3 py-3 font-medium text-gray-500 w-10">
                  No.
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[140px]">
                  Role
                </th>
                <th className="text-center px-3 py-3 font-medium text-gray-500 w-16">
                  Time
                </th>
                {sortedSessions.map((s) => (
                  <th
                    key={s.id}
                    className="text-center px-4 py-3 font-medium text-gray-700 min-w-[160px]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>{dayjs(s.date).format('MMM D, YYYY')}</span>
                      {s.is_cancelled && (
                        <span className="text-red-500 text-xs font-normal">
                          Cancelled
                        </span>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingSession(s)}
                          className="text-blue-400 hover:text-blue-600 text-xs font-normal transition-colors"
                          aria-label={`Edit session ${dayjs(s.date).format('MMM D, YYYY')}`}
                        >
                          ✏ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-gray-300 hover:text-red-500 text-xs font-normal transition-colors"
                          aria-label={`Delete session ${dayjs(s.date).format('MMM D, YYYY')}`}
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => {
                const showSeparator = row.isBackup && !rows[idx - 1]?.isBackup;
                return (
                  <Fragment key={`${row.role}-${row.slot}`}>
                    {showSeparator && (
                      <tr>
                        <td colSpan={3 + sortedSessions.length} className="p-0">
                          <div className="border-t-2 border-dashed border-gray-300 mx-2" />
                        </td>
                      </tr>
                    )}
                    <tr
                      className={
                        row.isBackup
                          ? 'bg-gray-50/70'
                          : 'hover:bg-blue-50/30 transition-colors'
                      }
                    >
                      <td className="px-3 py-2.5 text-center text-gray-400 font-mono text-xs">
                        {row.no ?? (
                          <span className="italic text-gray-300">Bk</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-700">
                        {row.label}
                      </td>
                      <td className="px-3 py-2.5 text-center text-gray-400 text-xs">
                        {ROLE_TIME[row.role]}
                      </td>
                      {sortedSessions.map((s) => {
                        const outOfScope =
                          ((row.role === OfflineRole.SPEAKER ||
                            row.role === OfflineRole.EVALUATOR) &&
                            row.slot >= s.num_speakers) ||
                          (row.role === OfflineRole.BACKUP_SPEAKER &&
                            row.slot >= s.num_backup_speakers);
                        const assignment = getAssignment(s, row.role, row.slot);
                        return (
                          <td
                            key={s.id}
                            className={`px-4 py-2.5 text-center ${
                              outOfScope ? 'bg-gray-50 text-gray-300 text-xs' : 'text-gray-700'
                            }`}
                          >
                            {outOfScope ? (
                              'n/a'
                            ) : (
                              <CellContent assignment={assignment} role={row.role} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <OfflineSessionForm onClose={() => setShowCreate(false)} />}
      {editingSession && (
        <OfflineSessionForm
          session={editingSession}
          onClose={() => setEditingSession(null)}
        />
      )}
    </div>
  );
}

