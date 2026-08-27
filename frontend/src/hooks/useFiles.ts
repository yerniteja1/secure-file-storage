import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesAPI, FileListParams } from '../api';

export function useFiles(params: FileListParams = {}) {
  const { page = 1, limit = 10, search, isPublic, trash } = params;

  return useQuery({
    queryKey: ['files', page, search, isPublic, trash],
    queryFn: () => filesAPI.list({ page, limit, search, isPublic, trash }),
    select: (response) => response.data,
  });
}

export function useFile(id: string) {
  return useQuery({
    queryKey: ['file', id],
    queryFn: () => filesAPI.get(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
}

export function usePublicFile(shareId: string | undefined) {
  return useQuery({
    queryKey: ['publicFile', shareId],
    queryFn: () => filesAPI.getPublic(shareId!),
    select: (response) => response.data.data,
    enabled: !!shareId,
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => filesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useRestoreFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => filesAPI.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function usePermanentDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => filesAPI.permanentDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useToggleShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => filesAPI.toggleShare(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useUpdateFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { originalName?: string } }) =>
      filesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}
