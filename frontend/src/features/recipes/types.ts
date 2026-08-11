// Recipe domain types. Mirrors backend/app/recipe/schemas.py and
// backend/app/workstep/schemas.py.

import type { Allergen } from '../allergens/types';

export interface Workstep {
  step_number: number;
  title: string;
  description: string;
}

export interface WorkstepInput {
  title: string;
  description: string;
}

export interface RecipeIngredient {
  ingredient_id: string;
  name: string;
  amount: string;
  unit: string;
  position: number;
  allergens: Allergen[];
}

// One ingredient line on write: either an existing ingredient_id or a bare
// name the backend resolves-or-creates into a master ingredient row.
export interface RecipeIngredientInput {
  ingredient_id?: string | null;
  name?: string | null;
  amount: string;
  unit: string;
}

export interface RecipeTag {
  id: string;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  origin: string | null;
  created_at: string;
  updated_at: string;
  worksteps: Workstep[];
  ingredients: RecipeIngredient[];
  tags: RecipeTag[];
}

// Shape sent to the backend when creating a recipe (POST): all fields
// required by the backend's RecipeInputSchema.
export interface RecipeInput {
  title: string;
  description: string;
  origin?: string | null;
  tags: string[];
  ingredients: RecipeIngredientInput[];
  worksteps: WorkstepInput[];
}

// Shape sent on PATCH: every field optional, omitted fields left untouched.
export type RecipePatchInput = Partial<RecipeInput>;
