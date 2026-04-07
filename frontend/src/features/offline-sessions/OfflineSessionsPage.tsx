import { useState, Fragment } from 'react';
import dayjs from 'dayjs';
import {
  useOfflineSessions,
  useCreateOfflineSession,
  useDeleteOfflineSession,
  useOfflineSessionSuggest,
} from './useOfflineSessions';
import { OfflineRole } from './offlineSession.types';
import type {
  AssignmentPayload,
  OfflineSession,
  OfflineSessionAssignment,
  OfflineSuggestResult,
} from './offlineSession.types';
import type { Member } from '../members/member.types';

function buildAssignmentsFromSuggestion(
  suggestion: OfflineSuggestResult,
): AssignmentPayload[] {
  const assignments: AssignmentPayload[] = [];
  const addOne = (member: Member | null, role: OfflineRole, slot = 0) => {
    if (member) {
      assignments.push({ member_id: member.id, role, slot_index: slot });
    }
  };
  addOne(suggestion.toast_master, OfflineRole.TOAST_MASTER);
  addOne(suggestion.table_tonic, OfflineRole.TABLE_TONIC);
  suggestion.speakers.forEach((s, i) =>
    addOne(s, OfflineRole.SPEAKER, i),
  );
  suggestion.evaluators.forEach((e, i) =>
    addOne(e, OfflineRole.EVALUATOR, i),
  );
  addOne(suggestion.topic_master, OfflineRole.TOPIC_MASTER);
  addOne(suggestion.uh_ah_counter, OfflineRole.UH_AH_COUNTER);
  addOne(suggestion.timer, OfflineRole.TIMER);
  addOne(suggestion.general_evaluator, OfflineRole.GENERAL_EVALUATOR);
  suggestion.backup_speakers.forEach((b, i) =>
    addOne(b, OfflineRole.BACKUP_SPEAKER, i),
  );
  return assignments;
}

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

interface CreateSessionFormProps {
  onClose: () => void;
}

function CreateSessionForm({ onClose }: CreateSessionFormProps) {
  const [date, setDate] = useState(dayjs().add(1, 'week').format('YYYY-MM-DD'));
  const [numSpeakers, setNumSpeakers] = useState(2);
  const [numBackup, setNumBackup] = useState(1);
  const [runSuggest, setRunSuggest] = useState(false);
  const { data: suggestion, isLoading: isSuggesting } =
    useOfflineSessionSuggest(numSpeakers, numBackup, runSuggest);
  const createSession = useCreateOfflineSession();

  const handleSave = () => {
    const assignments = suggestion
      ? buildAssignmentsFromSuggestion(suggestion)
      : [];
    createSession.mutate(
      { date, num_speakers: numSpeakers, num_backup_speakers: numBackup, assignments },
      { onSuccess: onClose },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label="Create offline session"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900">
          New Offline Session
        </h2>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="offline-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              id="offline-date"
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setRunSuggest(false); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="num-speakers"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Speakers
            </label>
            <input
              id="num-speakers"
              type="number"
              min={1}
              max={5}
              value={numSpeakers}
              onChange={(e) => { setNumSpeakers(Number(e.target.value)); setRunSuggest(false); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="num-backup"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Backups
            </label>
            <input
              id="num-backup"
              type="number"
              min={0}
              max={3}
              value={numBackup}
              onChange={(e) => { setNumBackup(Number(e.target.value)); setRunSuggest(false); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={() => setRunSuggest(true)}
          disabled={isSuggesting}
          className="w-full border border-blue-300 text-blue-600 rounded-lg py-2 text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          {isSuggesting ? 'Generating suggestions…' : '✨ Auto-Suggest Roles'}
        </button>

        {suggestion && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            {[
              ['Toast Master', suggestion.toast_master?.name],
              ['Table Tonic', suggestion.table_tonic?.name],
              ...suggestion.speakers.map((s, i) => [
                `Speaker ${i + 1}`,
                s ? `${s.name} (P${s.project_level + 1})` : '—',
              ]),
              ...suggestion.evaluators.map((e, i) => [
                `Evaluator ${i + 1}`,
                e?.name ?? 'No eligible evaluator',
              ]),
              ['Topic Master', suggestion.topic_master?.name],
              ['Uh/Ah Counter', suggestion.uh_ah_counter?.name],
              ['Timer', suggestion.timer?.name],
              ['General Evaluator', suggestion.general_evaluator?.name],
              ...suggestion.backup_speakers.map((b, i) => [
                `Backup Speaker ${i + 1}`,
                b ? `${b.name} (P${b.project_level + 1})` : '—',
              ]),
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between">
                <span className="text-gray-500">{label as string}</span>
                <span className="font-medium">{(value as string) ?? '—'}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={createSession.isPending}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createSession.isPending ? 'Saving…' : 'Save Session'}
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
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-gray-300 hover:text-red-500 text-xs font-normal transition-colors"
                        aria-label={`Delete session ${dayjs(s.date).format('MMM D, YYYY')}`}
                      >
                        ✕ Delete
                      </button>
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

      {showCreate && <CreateSessionForm onClose={() => setShowCreate(false)} />}
    </div>
  );
}

