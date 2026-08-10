import { type Page, request, toQueryString } from '../../api/client';
import type { Recipe, RecipeInput, RecipePatchInput } from './types';

export interface ListRecipesParams {
  page?: number;
  page_size?: number;
  [key: string]: string | number | undefined;
}

export function fetchRecipes(
  params: ListRecipesParams = {},
): Promise<Page<Recipe>> {
  return request<Page<Recipe>>(`/recipes${toQueryString(params)}`);
}

export function fetchRecipe(id: string): Promise<Recipe> {
  return request<Recipe>(`/recipes/${id}`);
}

export function createRecipe(input: RecipeInput): Promise<Recipe> {
  return request<Recipe>('/recipes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateRecipe(
  id: string,
  input: RecipePatchInput,
): Promise<Recipe> {
  return request<Recipe>(`/recipes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteRecipe(id: string): Promise<void> {
  return request<void>(`/recipes/${id}`, { method: 'DELETE' });
}
