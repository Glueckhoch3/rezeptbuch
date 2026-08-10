import { type Page, request, toQueryString } from '../../api/client';
import type { Allergen } from './types';

export interface ListAllergensParams {
  q?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | undefined;
}

export function fetchAllergens(
  params: ListAllergensParams = {},
): Promise<Page<Allergen>> {
  return request<Page<Allergen>>(`/allergens${toQueryString(params)}`);
}

export function createAllergen(name: string): Promise<Allergen> {
  return request<Allergen>('/allergens', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function deleteAllergen(id: string): Promise<void> {
  return request<void>(`/allergens/${id}`, { method: 'DELETE' });
}
