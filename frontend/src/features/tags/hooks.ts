import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import * as api from './api';
import type { ListTagsParams } from './api';

export function useTags(params: ListTagsParams = {}) {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: () => api.fetchTags(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createTag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });
}
