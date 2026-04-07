import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  useOnlineSessions,
  useCreateOnlineSession,
  useUpdateOnlineSession,
  useDeleteOnlineSession,
  useOnlineSessionSuggest,
} from './useOnlineSessions';
import { useMembers } from '../members/useMembers';
import type { OnlineSession } from './onlineSession.types';
import type { Member } from '../members/member.types';

function getNextWednesday(): string {
  const today = dayjs();
  const daysUntilWed = (3 - today.day() + 7) % 7 || 7;
  return today.add(daysUntilWed, 'day').format('YYYY-MM-DD');
}

// ─── Shared member select ─────────────────────────────────────────────────────

function MemberSelect({
  id,
  value,
  onChange,
  members,
  placeholder = '— Unassigned —',
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  members: Member[];
  placeholder?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      <option value="">{placeholder}</option>
      {members.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}

// ─── Session form (create + edit) ────────────────────────────────────────────

interface SessionFormProps {
  session?: OnlineSession;
  onClose: () => void;
}

function SessionForm({ session, onClose }: SessionFormProps) {
  const isEdit = session !== undefined;

  const [date, setDate] = useState(session?.date ?? getNextWednesday());
  const [mainChairmanId, setMainChairmanId] = useState(session?.main_chairman_id ?? '');
  const [subChairmanId, setSubChairmanId] = useState(session?.sub_chairman_id ?? '');
  const [speaker1Id, setSpeaker1Id] = useState(session?.speaker1_id ?? '');
  const [speaker2Id, setSpeaker2Id] = useState(session?.speaker2_id ?? '');
  const [isCancelled, setIsCancelled] = useState(session?.is_cancelled ?? false);
  const [suggestCount, setSuggestCount] = useState(0);

  const { data: membersPage } = useMembers();
  const members = membersPage?.data ?? [];

  const { data: suggestion, isLoading: isSuggesting } = useOnlineSessionSuggest(
    date,
    suggestCount,
  );

  const createSession = useCreateOnlineSession();
  const updateSession = useUpdateOnlineSession();
  const isPending = createSession.isPending || updateSession.isPending;

  // Apply suggestion into dropdowns whenever a new suggestion arrives
  useEffect(() => {
    if (!suggestion) return;
    if (suggestion.main_chairman?.id) setMainChairmanId(suggestion.main_chairman.id);
    if (suggestion.sub_chairman?.id) setSubChairmanId(suggestion.sub_chairman.id);
    if (suggestion.speaker1?.id) setSpeaker1Id(suggestion.speaker1.id);
    if (suggestion.speaker2?.id) setSpeaker2Id(suggestion.speaker2.id);
  }, [suggestion]);

  const handleSuggest = () => {
    setMainChairmanId('');
    setSubChairmanId('');
    setSpeaker1Id('');
    setSpeaker2Id('');
    setSuggestCount((c) => c + 1);
  };

  const handleSave = () => {
    const payload = {
      date,
      main_chairman_id: mainChairmanId || undefined,
      sub_chairman_id: subChairmanId || undefined,
      speaker1_id: speaker1Id || undefined,
      speaker2_id: speaker2Id || undefined,
      is_cancelled: isCancelled,
    };
    if (isEdit) {
      updateSession.mutate({ id: session.id, payload }, { onSuccess: onClose });
    } else {
      createSession.mutate(payload, { onSuccess: onClose });
    }
  };

  const ROLE_FIELDS = [
    { label: 'Main Chairman', value: mainChairmanId, setter: setMainChairmanId, inputId: 'main-chairman' },
    { label: 'Sub Chairman', value: subChairmanId, setter: setSubChairmanId, inputId: 'sub-chairman' },
    { label: 'Speaker 1', value: speaker1Id, setter: setSpeaker1Id, inputId: 'speaker-1' },
    { label: 'Speaker 2', value: speaker2Id, setter: setSpeaker2Id, inputId: 'speaker-2' },
  ] as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit online session' : 'Create online session'}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit Online Session' : 'New Online Session'}
        </h2>

        {/* Date */}
        <div>
          <label htmlFor="session-date" className="block text-sm font-medium text-gray-700 mb-1">
            Session Date
          </label>
          <input
            id="session-date"
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setSuggestCount(0); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Auto-suggest button */}
        <button
          onClick={handleSuggest}
          disabled={isSuggesting}
          className="w-full border border-blue-300 text-blue-600 rounded-lg py-2 text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          {isSuggesting ? 'Generating…' : '✨ Auto-Suggest Roles'}
        </button>

        {/* Role dropdowns */}
        <div className="space-y-3">
          {ROLE_FIELDS.map(({ label, value, setter, inputId }) => (
            <div key={inputId}>
              <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <MemberSelect
                id={inputId}
                value={value}
                onChange={setter}
                members={members}
              />
            </div>
          ))}
        </div>

        {/* Cancelled toggle (edit mode only) */}
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

export function OnlineSessionsPage() {
  const { data: sessions, isLoading, error } = useOnlineSessions();
  const deleteSession = useDeleteOnlineSession();
  const [showCreate, setShowCreate] = useState(false);
  const [editingSession, setEditingSession] = useState<OnlineSession | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this session?')) {
      deleteSession.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Online Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Wednesday 11:20 — weekly
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Main Chairman</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sub Chairman</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Speaker 1</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Speaker 2</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions?.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-8 text-sm">
                    No sessions yet. Create the first one!
                  </td>
                </tr>
              )}
              {sessions?.map((session: OnlineSession) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {dayjs(session.date).format('MMM D, YYYY')}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {session.main_chairman?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {session.sub_chairman?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {session.speaker1?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {session.speaker2?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {session.is_cancelled ? (
                      <span className="text-red-500 text-xs font-medium">Cancelled</span>
                    ) : (
                      <span className="text-green-600 text-xs font-medium">Scheduled</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingSession(session)}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <SessionForm onClose={() => setShowCreate(false)} />}
      {editingSession && (
        <SessionForm
          session={editingSession}
          onClose={() => setEditingSession(null)}
        />
      )}
    </div>
  );
}
