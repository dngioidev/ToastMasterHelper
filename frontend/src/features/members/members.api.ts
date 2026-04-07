import { api } from '../../lib/api';
import type {
  CreateMemberPayload,
  Member,
  PaginatedMembers,
  UpdateMemberPayload,
} from './member.types';

export const membersApi = {
  getAll: (page = 1, limit = 50): Promise<PaginatedMembers> =>
    api.get('/members', { params: { page, limit } }).then((r) => r.data),

  getOne: (id: string): Promise<Member> =>
    api.get(`/members/${id}`).then((r) => r.data),

  create: (payload: CreateMemberPayload): Promise<Member> =>
    api.post('/members', payload).then((r) => r.data),

  update: (id: string, payload: UpdateMemberPayload): Promise<Member> =>
    api.patch(`/members/${id}`, payload).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/members/${id}`).then(() => undefined),
};
