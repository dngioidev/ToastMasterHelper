import { useForm } from 'react-hook-form';
import { MemberStatus } from './member.types';
import type { CreateMemberPayload } from './member.types';
import type { Member } from './member.types';

interface MemberFormModalProps {
  member?: Member;
  onSubmit: (data: CreateMemberPayload) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function MemberFormModal({
  member,
  onSubmit,
  onClose,
  isLoading,
}: MemberFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMemberPayload>({
    defaultValues: {
      name: member?.name ?? '',
      status: member?.status ?? MemberStatus.ACTIVE,
      project_level: member?.project_level ?? 0,
      online_as_chairman: member?.online_as_chairman ?? true,
      online_as_speaker: member?.online_as_speaker ?? true,
      attends_offline: member?.attends_offline ?? true,
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label={member ? 'Edit member' : 'Add member'}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {member ? 'Edit Member' : 'Add Member'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p role="alert" className="text-xs text-red-600 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('status')}
            >
              <option value={MemberStatus.ACTIVE}>Active</option>
              <option value={MemberStatus.LEAVE}>Leave</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="project_level"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Project Level (0–10)
            </label>
            <input
              id="project_level"
              type="number"
              min={0}
              max={10}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('project_level', {
                valueAsNumber: true,
                min: { value: 0, message: 'Min 0' },
                max: { value: 10, message: 'Max 10' },
              })}
            />
            {errors.project_level && (
              <p role="alert" className="text-xs text-red-600 mt-1">
                {errors.project_level.message}
              </p>
            )}
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Session Participation
            </p>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Online (Wed 11:20)</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  {...register('online_as_chairman')}
                />
                <span className="text-sm text-gray-700">
                  As <strong>Chairman</strong> (main / sub)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  {...register('online_as_speaker')}
                />
                <span className="text-sm text-gray-700">
                  As <strong>Speaker</strong>
                </span>
              </label>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Offline (in-person)</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  {...register('attends_offline')}
                />
                <span className="text-sm text-gray-700">
                  Joins <strong>Offline</strong> sessions
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
