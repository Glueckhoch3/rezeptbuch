import { type Page, request, toQueryString } from '../../api/client';
import type { Recipe } from '../recipes/types';
import type { SearchParams } from './types';

export function searchRecipes(params: SearchParams): Promise<Page<Recipe>> {
  return request<Page<Recipe>>(`/recipes/search${toQueryString(params)}`);
}
