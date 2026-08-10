import { keepPreviousData, useQuery } from '@tanstack/react-query';
import * as api from './api';
import type { SearchParams } from './types';

export function useSearchRecipes(params: SearchParams) {
  const hasFilter = Boolean(
    params.tag || params.ingredient || params.allergen || params.q,
  );
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => api.searchRecipes(params),
    enabled: hasFilter,
    placeholderData: keepPreviousData,
  });
}
