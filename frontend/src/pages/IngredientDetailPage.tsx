import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { ApiError } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorBanner } from '../components/ErrorBanner';
import { AllergenBadge } from '../features/allergens/components/AllergenBadge';
import {
  useDeleteIngredient,
  useIngredient,
  useSetIngredientAllergens,
} from '../features/ingredients/hooks';
import { RecipeCard } from '../features/recipes/components/RecipeCard';
import { useSearchRecipes } from '../features/search/hooks';

export function IngredientDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: ingredient, isPending, isError, error } = useIngredient(id);
  const deleteIngredient = useDeleteIngredient();
  const setAllergens = useSetIngredientAllergens(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [allergensInput, setAllergensInput] = useState('');

  // Search by exact ingredient name (the backend filter matches by exact
  // name, not substring) once the ingredient has loaded.
  const usedInRecipes = useSearchRecipes({ ingredient: ingredient?.name });

  useEffect(() => {
    if (ingredient) {
      setAllergensInput(ingredient.allergens.map((a) => a.name).join(', '));
    }
  }, [ingredient]);

  if (isPending) return <p className="muted">Loading ingredient…</p>;
  if (isError) return <ErrorBanner error={error as ApiError} />;

  const handleDelete = async () => {
    try {
      await deleteIngredient.mutateAsync(id);
      navigate('/ingredients');
    } catch {
      setConfirmOpen(false);
    }
  };

  const handleAllergensSubmit = (event: FormEvent) => {
    event.preventDefault();
    const names = allergensInput
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
    setAllergens.mutate(names);
  };

  return (
    <article>
      <div className="detail-header">
        <h1>{ingredient.name}</h1>
        <div className="detail-actions">
          <button
            type="button"
            className="button button-danger"
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {deleteIngredient.isError && (
        <ErrorBanner error={deleteIngredient.error as ApiError} />
      )}

      {ingredient.description && <p>{ingredient.description}</p>}

      <h2>Allergens</h2>
      {ingredient.allergens.length > 0 && (
        <ul className="badge-list">
          {ingredient.allergens.map((allergen) => (
            <li key={allergen.id}>
              <AllergenBadge allergen={allergen} />
            </li>
          ))}
        </ul>
      )}
      <form className="field" onSubmit={handleAllergensSubmit}>
        <span>Edit allergens (comma-separated)</span>
        <div className="inline-form">
          <input
            type="text"
            placeholder="e.g. gluten, egg"
            value={allergensInput}
            onChange={(e) => setAllergensInput(e.target.value)}
          />
          <button
            type="submit"
            className="button"
            disabled={setAllergens.isPending}
          >
            Save
          </button>
        </div>
      </form>
      {setAllergens.isError && (
        <ErrorBanner error={setAllergens.error as ApiError} />
      )}

      <h2>Recipes using this ingredient</h2>
      {usedInRecipes.isPending && <p className="muted">Loading recipes…</p>}
      {usedInRecipes.data && usedInRecipes.data.items.length === 0 && (
        <p className="empty-state">No recipes use this ingredient yet.</p>
      )}
      {usedInRecipes.data && usedInRecipes.data.items.length > 0 && (
        <ul className="recipe-list">
          {usedInRecipes.data.items.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </ul>
      )}

      <p>
        <Link to="/ingredients">← Back to all ingredients</Link>
      </p>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete ingredient"
        message={`Delete "${ingredient.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  );
}
