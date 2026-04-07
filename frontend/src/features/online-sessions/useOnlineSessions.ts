import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { onlineSessionsApi } from './onlineSessions.api';
import type {
  CreateOnlineSessionPayload,
  UpdateOnlineSessionPayload,
} from './onlineSession.types';

export function useOnlineSessions() {
  return useQuery({
    queryKey: ['online-sessions'],
    queryFn: () => onlineSessionsApi.getAll(),
  });
}

export function useOnlineSessionSuggest(date: string, count: number) {
  return useQuery({
    queryKey: ['online-sessions', 'suggest', date, count],
    queryFn: () => onlineSessionsApi.suggest(date),
    enabled: count > 0 && date.length > 0,
    gcTime: 0,
  });
}

export function useCreateOnlineSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOnlineSessionPayload) =>
      onlineSessionsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['online-sessions'] }),
  });
}

export function useUpdateOnlineSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateOnlineSessionPayload;
    }) => onlineSessionsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['online-sessions'] }),
  });
}

export function useDeleteOnlineSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => onlineSessionsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['online-sessions'] }),
  });
}
