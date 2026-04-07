import type { MemberStatus } from '../members/member.types';

export interface MemberStats {
  id: string;
  name: string;
  status: MemberStatus;
  project_level: number;
  role_counts: Record<string, number>;
}

export interface DashboardStats {
  total_members: number;
  active_members: number;
  leave_members: number;
  total_online_sessions: number;
  total_offline_sessions: number;
  next_online_session: string | null;
  next_offline_session: string | null;
  top_members: MemberStats[];
}
