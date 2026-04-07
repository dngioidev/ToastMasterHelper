import { useState } from 'react';
import dayjs from 'dayjs';
import {
  useOnlineSessions,
  useCreateOnlineSession,
  useDeleteOnlineSession,
  useOnlineSessionSuggest,
} from './useOnlineSessions';
import type { OnlineSession } from './onlineSession.types';

function getNextWednesday(): string {
  const today = dayjs();
  const daysUntilWed = (3 - today.day() + 7) % 7 || 7;
  return today.add(daysUntilWed, 'day').format('YYYY-MM-DD');
}

interface CreateSessionFormProps {
  onClose: () => void;
}

function CreateSessionForm({ onClose }: CreateSessionFormProps) {
  const [date, setDate] = useState(getNextWednesday());
  const [runSuggest, setRunSuggest] = useState(false);
  const { data: suggestion, isLoading: isSuggesting } = useOnlineSessionSuggest(
    date,
    runSuggest,
  );
  const createSession = useCreateOnlineSession();

  const handleSave = () => {
    createSession.mutate(
      {
        date,
        main_chairman_id: suggestion?.main_chairman?.id,
        sub_chairman_id: suggestion?.sub_chairman?.id,
        speaker1_id: suggestion?.speaker1?.id,
        speaker2_id: suggestion?.speaker2?.id,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label="Create online session"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          New Online Session
        </h2>

        <div>
          <label
            htmlFor="session-date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Session Date
          </label>
          <input
            id="session-date"
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setRunSuggest(false); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            <div className="flex justify-between">
              <span className="text-gray-500">Main Chairman</span>
              <span className="font-medium">
                {suggestion.main_chairman?.name ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sub Chairman</span>
              <span className="font-medium">
                {suggestion.sub_chairman?.name ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Speaker 1</span>
              <span className="font-medium">
                {suggestion.speaker1?.name ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Speaker 2</span>
              <span className="font-medium">
                {suggestion.speaker2?.name ?? '—'}
              </span>
            </div>
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

export function OnlineSessionsPage() {
  const { data: sessions, isLoading, error } = useOnlineSessions();
  const deleteSession = useDeleteOnlineSession();
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Main Chairman
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Sub Chairman
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Speaker 1
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Speaker 2
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(sessions?.length === 0) && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-gray-400 py-8 text-sm"
                  >
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
                      <span className="text-red-500 text-xs font-medium">
                        Cancelled
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs font-medium">
                        Scheduled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreateSessionForm onClose={() => setShowCreate(false)} />}
    </div>
  );
}
