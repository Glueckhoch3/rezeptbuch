// Ingredient master row. Mirrors backend/app/ingredient/schemas.py.

import type { Allergen } from '../allergens/types';

export interface Ingredient {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  allergens: Allergen[];
}

export interface IngredientInput {
  name: string;
  description?: string | null;
}
