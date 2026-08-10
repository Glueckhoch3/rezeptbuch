import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { ApiError } from '../../../api/client';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { TagPicker } from '../../tags/components/TagPicker';
import {
  emptyRecipeFormValues,
  recipeFormSchema,
  type RecipeFormValues,
} from '../schema';
import type { RecipeInput } from '../types';
import { IngredientFieldArray } from './IngredientFieldArray';
import { WorkstepFieldArray } from './WorkstepFieldArray';

interface Props {
  initial?: RecipeFormValues;
  submitLabel: string;
  submitting: boolean;
  error: ApiError | null;
  onSubmit: (input: RecipeInput) => void;
  onCancel: () => void;
}

// Shared create/edit form. Client-side validation (react-hook-form + zod)
// mirrors the backend schema for instant UX feedback, but the backend
// remains the source of truth (ErrorBanner surfaces its response verbatim).
export function RecipeForm({
  initial,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: initial ?? emptyRecipeFormValues(),
  });

  const submit = (values: RecipeFormValues) => {
    const input: RecipeInput = {
      title: values.title.trim(),
      description: values.description.trim(),
      origin: values.origin.trim() || null,
      tags: values.tags,
      ingredients: values.ingredients.map((row) =>
        row.ingredientId
          ? {
              ingredient_id: row.ingredientId,
              amount: row.amount.trim(),
              unit: row.unit.trim(),
            }
          : {
              name: row.name.trim(),
              amount: row.amount.trim(),
              unit: row.unit.trim(),
            },
      ),
      worksteps: values.worksteps.map((row) => ({
        title: row.title.trim(),
        description: row.description.trim(),
      })),
    };
    onSubmit(input);
  };

  const ingredientsError =
    errors.ingredients?.message ?? errors.ingredients?.root?.message;
  const workstepsError =
    errors.worksteps?.message ?? errors.worksteps?.root?.message;

  return (
    <form className="recipe-form" onSubmit={handleSubmit(submit)}>
      <ErrorBanner error={error} />

      <label className="field">
        <span>Title</span>
        <input
          type="text"
          placeholder="e.g. Tomato soup"
          {...register('title')}
        />
        {errors.title && (
          <span className="field-error">{errors.title.message}</span>
        )}
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          rows={3}
          placeholder="A short description"
          {...register('description')}
        />
        {errors.description && (
          <span className="field-error">{errors.description.message}</span>
        )}
      </label>

      <label className="field">
        <span>Origin</span>
        <input
          type="text"
          placeholder="e.g. Grandma's kitchen"
          {...register('origin')}
        />
      </label>

      <label className="field">
        <span>Tags</span>
        <TagPicker control={control} />
      </label>

      <IngredientFieldArray control={control} register={register} />
      {ingredientsError && (
        <div className="error-banner" role="alert">
          {ingredientsError}
        </div>
      )}

      <WorkstepFieldArray control={control} register={register} />
      {workstepsError && (
        <div className="error-banner" role="alert">
          {workstepsError}
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="button button-primary"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
