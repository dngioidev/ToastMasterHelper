import dayjs from 'dayjs';
import { useDashboard } from './useDashboard';
import type { MemberStats } from './dashboard.types';

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: 'blue' | 'green' | 'yellow' | 'purple';
}

function StatCard({ label, value, accent = 'blue' }: StatCardProps) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <div className={`rounded-xl p-5 ${colors[accent]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return <p className="text-gray-500 text-sm">Loading dashboard…</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-red-600 text-sm">
        Failed to load dashboard.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">TM Scheduler overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={data?.total_members ?? 0}
          accent="blue"
        />
        <StatCard
          label="Active Members"
          value={data?.active_members ?? 0}
          accent="green"
        />
        <StatCard
          label="On Leave"
          value={data?.leave_members ?? 0}
          accent="yellow"
        />
        <StatCard
          label="Online Sessions"
          value={data?.total_online_sessions ?? 0}
          accent="purple"
        />
      </div>

      {/* Next sessions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Next Online Session
          </h2>
          {data?.next_online_session ? (
            <p className="text-lg font-bold text-blue-700">
              {dayjs(data.next_online_session).format('ddd, MMM D YYYY')}
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Not scheduled yet</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Next Offline Session
          </h2>
          {data?.next_offline_session ? (
            <p className="text-lg font-bold text-purple-700">
              {dayjs(data.next_offline_session).format('ddd, MMM D YYYY')}
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Not scheduled yet</p>
          )}
        </div>
      </div>

      {/* Top members */}
      {data?.top_members && data.top_members.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">
              Top Participating Members
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">
                  Member
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">
                  Level
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">
                  Total Roles
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.top_members.map((m: MemberStats) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-900 font-medium">
                    {m.name}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      {m.project_level}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {Object.values(m.role_counts ?? {}).reduce(
                      (sum, v) => sum + v,
                      0,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
