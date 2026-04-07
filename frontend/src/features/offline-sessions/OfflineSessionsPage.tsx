import { useState } from 'react';
import dayjs from 'dayjs';
import {
  useOfflineSessions,
  useCreateOfflineSession,
  useDeleteOfflineSession,
  useOfflineSessionSuggest,
} from './useOfflineSessions';
import {
  OfflineRole,
  OFFLINE_ROLE_LABELS,
} from './offlineSession.types';
import type {
  AssignmentPayload,
  OfflineSession,
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
                s ? `${s.name} (Lv.${s.project_level})` : '—',
              ]),
              ...suggestion.evaluators.map((e, i) => [
                `Evaluator ${i + 1}`,
                e ? `${e.name} (Lv.${e.project_level})` : 'No eligible evaluator',
              ]),
              ['Topic Master', suggestion.topic_master?.name],
              ['Uh/Ah Counter', suggestion.uh_ah_counter?.name],
              ['Timer', suggestion.timer?.name],
              ['General Evaluator', suggestion.general_evaluator?.name],
              ...suggestion.backup_speakers.map((b, i) => [
                `Backup Speaker ${i + 1}`,
                b ? `${b.name} (Lv.${b.project_level})` : '—',
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

function AssignmentsList({ session }: { session: OfflineSession }) {
  const byRole = session.assignments.reduce<
    Record<string, typeof session.assignments>
  >((acc, a) => {
    const key = a.role;
    acc[key] = acc[key] ?? [];
    acc[key].push(a);
    return acc;
  }, {});

  const roleOrder: OfflineRole[] = [
    OfflineRole.TOAST_MASTER,
    OfflineRole.TABLE_TONIC,
    OfflineRole.SPEAKER,
    OfflineRole.EVALUATOR,
    OfflineRole.TOPIC_MASTER,
    OfflineRole.UH_AH_COUNTER,
    OfflineRole.TIMER,
    OfflineRole.GENERAL_EVALUATOR,
    OfflineRole.BACKUP_SPEAKER,
  ];

  return (
    <div className="mt-2 space-y-1 text-xs text-gray-600">
      {roleOrder.map((role) => {
        const slots = byRole[role];
        if (!slots?.length) return null;
        return slots.map((a, i) => (
          <div key={a.id} className="flex justify-between">
            <span className="text-gray-400">
              {OFFLINE_ROLE_LABELS[role]}
              {slots.length > 1 ? ` ${i + 1}` : ''}
            </span>
            <span>
              {a.member?.name ?? '—'}
              {a.role === OfflineRole.SPEAKER && a.passed && (
                <span className="ml-1 text-green-600">(Passed)</span>
              )}
            </span>
          </div>
        ));
      })}
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Offline Sessions
          </h1>
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

      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions?.length === 0 && (
            <p className="text-gray-400 text-sm col-span-3 py-8 text-center">
              No offline sessions yet. Create the first one!
            </p>
          )}
          {sessions?.map((session: OfflineSession) => (
            <div
              key={session.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {dayjs(session.date).format('MMM D, YYYY')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {session.num_speakers} speaker
                    {session.num_speakers > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {session.is_cancelled && (
                    <span className="text-red-500 text-xs">Cancelled</span>
                  )}
                  <button
                    onClick={() => handleDelete(session.id)}
                    aria-label="Delete session"
                    className="text-gray-400 hover:text-red-500 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <AssignmentsList session={session} />
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateSessionForm onClose={() => setShowCreate(false)} />}
    </div>
  );
}
