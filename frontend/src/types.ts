// Shared domain types mirroring the backend recipe contract.

export interface Ingredient {
  amount: string;
  unit: string;
  name: string;
  position?: number;
}

export interface Instruction {
  text: string;
  step_number?: number;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
}

// Shape sent to the backend when creating or editing a recipe.
export interface RecipeInput {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
}
