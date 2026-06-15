import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, createRecipe } from '../api/client';
import { RecipeForm } from '../components/RecipeForm';
import type { RecipeInput } from '../types';

export function RecipeCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleSubmit = async (input: RecipeInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createRecipe(input);
      navigate(`/recipes/${created.id}`);
    } catch (e) {
      setError(e as ApiError);
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h1>New recipe</h1>
      <RecipeForm
        submitLabel="Create recipe"
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
      />
    </section>
  );
}
