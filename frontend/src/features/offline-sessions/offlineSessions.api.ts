import { api } from '../../lib/api';
import type {
  CreateOfflineSessionPayload,
  OfflineSession,
  OfflineSuggestResult,
  UpdateOfflineSessionPayload,
} from './offlineSession.types';

export const offlineSessionsApi = {
  getAll: (): Promise<OfflineSession[]> =>
    api.get('/sessions/offline').then((r) => r.data),

  getOne: (id: string): Promise<OfflineSession> =>
    api.get(`/sessions/offline/${id}`).then((r) => r.data),

  suggest: (numSpeakers = 2, numBackup = 1): Promise<OfflineSuggestResult> =>
    api
      .get('/sessions/offline/suggest', {
        params: { num_speakers: numSpeakers, num_backup: numBackup },
      })
      .then((r) => r.data),

  create: (payload: CreateOfflineSessionPayload): Promise<OfflineSession> =>
    api.post('/sessions/offline', payload).then((r) => r.data),

  update: (id: string, payload: UpdateOfflineSessionPayload): Promise<OfflineSession> =>
    api.patch(`/sessions/offline/${id}`, payload).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/sessions/offline/${id}`).then(() => undefined),
};
