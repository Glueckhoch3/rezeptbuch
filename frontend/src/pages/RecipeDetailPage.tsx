import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { ApiError } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorBanner } from '../components/ErrorBanner';
import { AllergenBadge } from '../features/allergens/components/AllergenBadge';
import type { Allergen } from '../features/allergens/types';
import { useDeleteRecipe, useRecipe } from '../features/recipes/hooks';

export function RecipeDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: recipe, isPending, isError, error } = useRecipe(id);
  const deleteRecipe = useDeleteRecipe();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isPending) return <p className="muted">Loading recipe…</p>;
  if (isError) return <ErrorBanner error={error as ApiError} />;

  const handleDelete = async () => {
    try {
      await deleteRecipe.mutateAsync(id);
      navigate('/');
    } catch {
      setConfirmOpen(false);
    }
  };

  // Allergens are derived from the recipe's ingredients rather than stored
  // on the recipe directly, so dedupe across ingredient lines.
  const allergens = Array.from(
    new Map<string, Allergen>(
      recipe.ingredients.flatMap((i) => i.allergens).map((a) => [a.id, a]),
    ).values(),
  );

  return (
    <article>
      <div className="detail-header">
        <h1>{recipe.title}</h1>
        <div className="detail-actions">
          <Link to={`/recipes/${recipe.id}/edit`} className="button">
            Edit
          </Link>
          <button
            type="button"
            className="button button-danger"
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {deleteRecipe.isError && (
        <ErrorBanner error={deleteRecipe.error as ApiError} />
      )}

      {recipe.origin && <p className="muted">Origin: {recipe.origin}</p>}
      {recipe.description && <p>{recipe.description}</p>}

      {recipe.tags.length > 0 && (
        <ul className="badge-list">
          {recipe.tags.map((tag) => (
            <li key={tag.id}>
              <Link
                to={`/?tag=${encodeURIComponent(tag.name)}`}
                className="badge"
              >
                {tag.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {allergens.length > 0 && (
        <>
          <h2>Allergens</h2>
          <ul className="badge-list">
            {allergens.map((allergen) => (
              <li key={allergen.id}>
                <AllergenBadge allergen={allergen} />
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Ingredients</h2>
      <ul className="ingredient-list">
        {recipe.ingredients.map((ing) => (
          <li key={`${ing.ingredient_id}-${ing.position}`}>
            {[ing.amount, ing.unit, ing.name].filter(Boolean).join(' ')}
          </li>
        ))}
      </ul>

      <h2>Worksteps</h2>
      <ol className="instruction-list">
        {recipe.worksteps.map((step) => (
          <li key={step.step_number}>
            <strong>{step.title}</strong>
            <p>{step.description}</p>
          </li>
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
