export enum MemberStatus {
  ACTIVE = 'Active',
  LEAVE = 'Leave',
}

export interface Member {
  id: string;
  name: string;
  status: MemberStatus;
  project_level: number;
  role_counts: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedMembers {
  data: Member[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateMemberPayload {
  name: string;
  status?: MemberStatus;
  project_level?: number;
}

export type UpdateMemberPayload = Partial<CreateMemberPayload>;
