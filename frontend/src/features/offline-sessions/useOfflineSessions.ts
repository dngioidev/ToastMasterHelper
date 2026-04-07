import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { offlineSessionsApi } from './offlineSessions.api';
import type {
  CreateOfflineSessionPayload,
  UpdateOfflineSessionPayload,
} from './offlineSession.types';

export function useOfflineSessions() {
  return useQuery({
    queryKey: ['offline-sessions'],
    queryFn: () => offlineSessionsApi.getAll(),
  });
}

export function useOfflineSessionSuggest(
  numSpeakers: number,
  numBackup: number,
  count: number,
) {
  return useQuery({
    queryKey: ['offline-sessions', 'suggest', numSpeakers, numBackup, count],
    queryFn: () => offlineSessionsApi.suggest(numSpeakers, numBackup),
    enabled: count > 0,
    gcTime: 0,
  });
}

export function useCreateOfflineSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOfflineSessionPayload) =>
      offlineSessionsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offline-sessions'] }),
  });
}

export function useUpdateOfflineSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateOfflineSessionPayload;
    }) => offlineSessionsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offline-sessions'] }),
  });
}

export function useDeleteOfflineSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offlineSessionsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offline-sessions'] }),
  });
}
