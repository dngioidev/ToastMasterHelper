import { useState } from 'react';
import { MemberFormModal } from './MemberFormModal';
import {
  useMembers,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
} from './useMembers';
import { MemberStatus } from './member.types';
import type { Member, CreateMemberPayload } from './member.types';

function StatusBadge({ status }: { status: MemberStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === MemberStatus.ACTIVE
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {status}
    </span>
  );
}

export function MembersPage() {
  const { data, isLoading, error } = useMembers();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>();
  const [search, setSearch] = useState('');

  const members = data?.data ?? [];
  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = (formData: CreateMemberPayload) => {
    if (editingMember) {
      updateMember.mutate(
        { id: editingMember.id, payload: formData },
        { onSuccess: () => { setShowModal(false); setEditingMember(undefined); } },
      );
    } else {
      createMember.mutate(formData, {
        onSuccess: () => setShowModal(false),
      });
    }
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this member?')) {
      deleteMember.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.total ?? 0} members total
          </p>
        </div>
        <button
          onClick={() => { setEditingMember(undefined); setShowModal(true); }}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add Member
        </button>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading && (
        <p className="text-gray-500 text-sm">Loading members…</p>
      )}

      {error && (
        <p role="alert" className="text-red-600 text-sm">
          Failed to load members.
        </p>
      )}

      {!isLoading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Level
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Speeches
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Chairings
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-400 py-8 text-sm"
                  >
                    No members found.
                  </td>
                </tr>
              )}
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {member.name}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      {member.project_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {member.role_counts?.speaker ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {(member.role_counts?.main_chairman ?? 0) +
                      (member.role_counts?.sub_chairman ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(member)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
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

      {showModal && (
        <MemberFormModal
          member={editingMember}
          onSubmit={handleSubmit}
          onClose={() => { setShowModal(false); setEditingMember(undefined); }}
          isLoading={createMember.isPending || updateMember.isPending}
        />
      )}
    </div>
  );
}
