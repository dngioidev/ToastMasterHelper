import { api } from '../../lib/api';
import type {
  CreateOnlineSessionPayload,
  OnlineSession,
  OnlineSessionSuggestion,
  UpdateOnlineSessionPayload,
} from './onlineSession.types';

export const onlineSessionsApi = {
  getAll: (): Promise<OnlineSession[]> =>
    api.get('/sessions/online').then((r) => r.data),

  getOne: (id: string): Promise<OnlineSession> =>
    api.get(`/sessions/online/${id}`).then((r) => r.data),

  suggest: (date: string): Promise<OnlineSessionSuggestion> =>
    api.get('/sessions/online/suggest', { params: { date } }).then((r) => r.data),

  create: (payload: CreateOnlineSessionPayload): Promise<OnlineSession> =>
    api.post('/sessions/online', payload).then((r) => r.data),

  update: (id: string, payload: UpdateOnlineSessionPayload): Promise<OnlineSession> =>
    api.patch(`/sessions/online/${id}`, payload).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/sessions/online/${id}`).then(() => undefined),
};
