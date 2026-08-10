import { useNavigate, useParams } from 'react-router-dom';
import type { ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { RecipeForm } from '../features/recipes/components/RecipeForm';
import { useRecipe, useUpdateRecipe } from '../features/recipes/hooks';
import type { RecipeFormValues } from '../features/recipes/schema';
import type { RecipeInput } from '../features/recipes/types';

export function RecipeEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: recipe, isPending, isError, error } = useRecipe(id);
  const updateRecipe = useUpdateRecipe(id);

  if (isPending) return <p className="muted">Loading recipe…</p>;
  if (isError) return <ErrorBanner error={error as ApiError} />;

  const initial: RecipeFormValues = {
    title: recipe.title,
    description: recipe.description,
    origin: recipe.origin ?? '',
    tags: recipe.tags.map((tag) => tag.name),
    ingredients: recipe.ingredients.map((ing) => ({
      ingredientId: ing.ingredient_id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
    })),
    worksteps: recipe.worksteps.map((step) => ({
      title: step.title,
      description: step.description,
    })),
  };

  const handleSubmit = async (input: RecipeInput) => {
    try {
      await updateRecipe.mutateAsync(input);
      navigate(`/recipes/${id}`);
    } catch {
      // error surfaced via updateRecipe.error below
    }
  };

  return (
    <section>
      <h1>Edit recipe</h1>
      <RecipeForm
        initial={initial}
        submitLabel="Save changes"
        submitting={updateRecipe.isPending}
        error={(updateRecipe.error as ApiError | null) ?? null}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/recipes/${id}`)}
      />
    </section>
  );
}
