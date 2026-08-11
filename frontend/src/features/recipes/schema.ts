// Client-side validation for the recipe form. UX feedback only — the backend
// (recipe/schemas.py) remains the source of truth and re-validates on submit.
import { z } from 'zod';

const ingredientRowSchema = z
  .object({
    ingredientId: z.string().nullable(),
    name: z.string().max(120, 'Ingredient name is too long.'),
    amount: z.string().max(50, 'Amount is too long.'),
    unit: z.string().max(31, 'Unit is too long.'),
  })
  .refine((row) => Boolean(row.ingredientId) || row.name.trim() !== '', {
    message: 'Pick an ingredient or type a name.',
    path: ['name'],
  });

const workstepRowSchema = z.object({
  title: z
    .string()
    .min(1, 'Step title is required.')
    .max(120, 'Step title must be 120 characters or fewer.'),
  description: z.string().min(1, 'Step description is required.'),
});

export const recipeFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required.')
    .max(255, 'Title must be 255 characters or fewer.'),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer.'),
  origin: z.string().max(255, 'Origin must be 255 characters or fewer.'),
  tags: z.array(z.string().min(1).max(63)),
  ingredients: z
    .array(ingredientRowSchema)
    .min(1, 'At least one ingredient is required.'),
  worksteps: z
    .array(workstepRowSchema)
    .min(1, 'At least one workstep is required.'),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export function emptyRecipeFormValues(): RecipeFormValues {
  return {
    title: '',
    description: '',
    origin: '',
    tags: [],
    ingredients: [{ ingredientId: null, name: '', amount: '', unit: '' }],
    worksteps: [{ title: '', description: '' }],
  };
}
