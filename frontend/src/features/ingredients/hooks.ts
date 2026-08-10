import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import * as api from './api';
import type { ListIngredientsParams } from './api';
import type { IngredientInput } from './types';

// Key factory keeps list and detail queries in separate branches so
// invalidating the list after a mutation never refetches a detail query for
// an ingredient that was just deleted (React Query prefix-matches query keys).
const keys = {
  list: (params: ListIngredientsParams) =>
    ['ingredients', 'list', params] as const,
  detail: (id: string) => ['ingredients', 'detail', id] as const,
};

export function useIngredients(params: ListIngredientsParams = {}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => api.fetchIngredients(params),
    placeholderData: keepPreviousData,
  });
}

// Debounced-search variant used by IngredientPicker; separate from
// useIngredients() so the picker's small top-N lookups don't share a cache
// bucket with the full paginated list page.
export function useIngredientSearch(query: string) {
  return useQuery({
    queryKey: ['ingredients', 'search', query],
    queryFn: () => api.fetchIngredients({ q: query, page_size: 10 }),
    enabled: query.trim().length > 0,
    placeholderData: keepPreviousData,
  });
}

export function useIngredient(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => api.fetchIngredient(id),
    enabled: Boolean(id),
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createIngredient,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['ingredients', 'list'] }),
  });
}

export function useUpdateIngredient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: IngredientInput) => api.updateIngredient(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', 'list'] });
      queryClient.invalidateQueries({ queryKey: keys.detail(id) });
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteIngredient,
    // See useDeleteRecipe: no removeQueries() here — the still-mounted
    // detail page's observer would otherwise trigger an immediate refetch
    // of the just-deleted ingredient and 404.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['ingredients', 'list'] }),
  });
}

export function useSetIngredientAllergens(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (allergens: string[]) =>
      api.setIngredientAllergens(id, allergens),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['ingredients', 'list'] });
    },
  });
}
