import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import * as api from './api';
import type { ListRecipesParams } from './api';
import type { RecipePatchInput } from './types';

// Key factory keeps list and detail queries in separate branches so
// invalidating the list after a mutation never refetches a detail query for
// a recipe that was just deleted (React Query prefix-matches query keys).
const keys = {
  list: (params: ListRecipesParams) => ['recipes', 'list', params] as const,
  detail: (id: string) => ['recipes', 'detail', id] as const,
};

export function useRecipes(params: ListRecipesParams = {}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => api.fetchRecipes(params),
    placeholderData: keepPreviousData,
  });
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => api.fetchRecipe(id),
    enabled: Boolean(id),
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createRecipe,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['recipes', 'list'] }),
  });
}

export function useUpdateRecipe(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecipePatchInput) => api.updateRecipe(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', 'list'] });
      queryClient.invalidateQueries({ queryKey: keys.detail(id) });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteRecipe,
    // Deliberately doesn't removeQueries() the detail key here: the detail
    // page calling this is still mounted (and its useRecipe observer still
    // active) at the moment this resolves, before the caller's navigate()
    // takes effect — removing an actively-observed query makes React Query
    // refetch it immediately, which 404s against the now-deleted recipe.
    // Leaving the stale entry for the query-client's default gcTime to
    // clean up avoids that race.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['recipes', 'list'] }),
  });
}
