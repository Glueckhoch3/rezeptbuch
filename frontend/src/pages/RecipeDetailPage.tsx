import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError, deleteRecipe, fetchRecipe } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorBanner } from '../components/ErrorBanner';
import type { Recipe } from '../types';

export function RecipeDetailPage() {
  const { id } = useParams();
  const recipeId = Number(id);
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(recipeId)) {
      setError(new ApiError('Invalid recipe id.', 400));
      setLoading(false);
      return;
    }

    fetchRecipe(recipeId)
      .then(setRecipe)
      .catch((e) => setError(e as ApiError))
      .finally(() => setLoading(false));
  }, [recipeId]);

  const handleDelete = async () => {
    try {
      await deleteRecipe(recipeId);
      navigate('/');
    } catch (e) {
      setError(e as ApiError);
      setConfirmOpen(false);
    }
  };

  if (loading) return <p className="muted">Loading recipe…</p>;
  if (error) return <ErrorBanner error={error} />;
  if (!recipe) return <p className="muted">Recipe not found.</p>;

  return (
    <article>
      <div className="detail-header">
        <h1>{recipe.title}</h1>
        <div className="detail-actions">
          <Link to={`/recipes/${recipe.id}/edit`} className="button">
            Edit
          </Link>
          <button
            className="button button-danger"
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </button>
        </div>
      </div>
      {recipe.description && <p>{recipe.description}</p>}

      <h2>Ingredients</h2>
      <ul className="ingredient-list">
        {recipe.ingredients.map((ing, i) => (
          <li key={i}>
            {[ing.amount, ing.unit, ing.name].filter(Boolean).join(' ')}
          </li>
        ))}
      </ul>

      <h2>Instructions</h2>
      <ol className="instruction-list">
        {recipe.instructions.map((ins, i) => (
          <li key={i}>{ins.text}</li>
        ))}
      </ol>

      <p>
        <Link to="/">← Back to all recipes</Link>
      </p>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete recipe"
        message={`Delete "${recipe.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  );
}
