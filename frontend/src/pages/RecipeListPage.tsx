import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, fetchRecipes } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import type { Recipe } from '../types';

export function RecipeListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    fetchRecipes()
      .then(setRecipes)
      .catch((e) => setError(e as ApiError))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading recipes…</p>;

  return (
    <section>
      <h1>Recipes</h1>
      <ErrorBanner error={error} />
      {!error && recipes.length === 0 && (
        <p className="muted">
          No recipes yet.{' '}
          <Link to="/recipes/new">Create your first recipe.</Link>
        </p>
      )}
      <ul className="recipe-list">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="recipe-card">
            <Link to={`/recipes/${recipe.id}`} className="recipe-card-title">
              {recipe.title}
            </Link>
            {recipe.description && (
              <p className="muted">{recipe.description}</p>
            )}
            <span className="recipe-card-meta">
              {recipe.ingredients.length} ingredients ·{' '}
              {recipe.instructions.length} steps
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
