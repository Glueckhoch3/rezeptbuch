import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, fetchRecipe, updateRecipe } from '../api/client';
import { RecipeForm } from '../components/RecipeForm';
import { ErrorBanner } from '../components/ErrorBanner';
import type { RecipeInput } from '../types';

export function RecipeEditPage() {
  const { id } = useParams();
  const recipeId = Number(id);
  const navigate = useNavigate();

  const [initial, setInitial] = useState<RecipeInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!Number.isFinite(recipeId)) {
      setError(new ApiError('Invalid recipe id.', 400));
      setLoading(false);
      return;
    }

    fetchRecipe(recipeId)
      .then((recipe) =>
        setInitial({
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients.map((i) => ({
            amount: i.amount,
            unit: i.unit,
            name: i.name,
          })),
          instructions: recipe.instructions.map((i) => ({ text: i.text })),
        }),
      )
      .catch((e) => setError(e as ApiError))
      .finally(() => setLoading(false));
  }, [recipeId]);

  const handleSubmit = async (input: RecipeInput) => {
    setSubmitting(true);
    setError(null);
    try {
      await updateRecipe(recipeId, input);
      navigate(`/recipes/${recipeId}`);
    } catch (e) {
      setError(e as ApiError);
      setSubmitting(false);
    }
  };

  if (loading) return <p className="muted">Loading recipe…</p>;
  if (!initial) return <ErrorBanner error={error} />;

  return (
    <section>
      <h1>Edit recipe</h1>
      <RecipeForm
        initial={initial}
        submitLabel="Save changes"
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/recipes/${recipeId}`)}
      />
    </section>
  );
}
