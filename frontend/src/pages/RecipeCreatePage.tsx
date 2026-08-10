import { useNavigate } from 'react-router-dom';
import type { ApiError } from '../api/client';
import { RecipeForm } from '../features/recipes/components/RecipeForm';
import { useCreateRecipe } from '../features/recipes/hooks';
import type { RecipeInput } from '../features/recipes/types';

export function RecipeCreatePage() {
  const navigate = useNavigate();
  const createRecipe = useCreateRecipe();

  const handleSubmit = async (input: RecipeInput) => {
    try {
      const created = await createRecipe.mutateAsync(input);
      navigate(`/recipes/${created.id}`);
    } catch {
      // error surfaced via createRecipe.error below
    }
  };

  return (
    <section>
      <h1>New recipe</h1>
      <RecipeForm
        submitLabel="Create recipe"
        submitting={createRecipe.isPending}
        error={(createRecipe.error as ApiError | null) ?? null}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
      />
    </section>
  );
}
