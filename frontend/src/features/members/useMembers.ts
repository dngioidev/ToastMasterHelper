import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { membersApi } from './members.api';
import type { CreateMemberPayload, UpdateMemberPayload } from './member.types';

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => membersApi.getAll(),
  });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMemberPayload) => membersApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMemberPayload }) =>
      membersApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => membersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}
