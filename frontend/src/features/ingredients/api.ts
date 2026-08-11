import { type Page, request, toQueryString } from '../../api/client';
import type { Ingredient, IngredientInput } from './types';

export interface ListIngredientsParams {
  q?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | undefined;
}

export function fetchIngredients(
  params: ListIngredientsParams = {},
): Promise<Page<Ingredient>> {
  return request<Page<Ingredient>>(`/ingredients${toQueryString(params)}`);
}

export function fetchIngredient(id: string): Promise<Ingredient> {
  return request<Ingredient>(`/ingredients/${id}`);
}

export function createIngredient(input: IngredientInput): Promise<Ingredient> {
  return request<Ingredient>('/ingredients', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateIngredient(
  id: string,
  input: IngredientInput,
): Promise<Ingredient> {
  return request<Ingredient>(`/ingredients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteIngredient(id: string): Promise<void> {
  return request<void>(`/ingredients/${id}`, { method: 'DELETE' });
}

// Replaces the ingredient's allergen links wholesale, by allergen name.
export function setIngredientAllergens(
  id: string,
  allergens: string[],
): Promise<Ingredient> {
  return request<Ingredient>(`/ingredients/${id}/allergens`, {
    method: 'PUT',
    body: JSON.stringify({ allergens }),
  });
}
