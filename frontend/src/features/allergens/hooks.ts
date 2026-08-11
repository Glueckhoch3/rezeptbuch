import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import * as api from './api';
import type { ListAllergensParams } from './api';

export function useAllergens(params: ListAllergensParams = {}) {
  return useQuery({
    queryKey: ['allergens', params],
    queryFn: () => api.fetchAllergens(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateAllergen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createAllergen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allergens'] }),
  });
}

export function useDeleteAllergen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteAllergen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allergens'] }),
  });
}
