import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { Pager } from '../components/Pager';
import { RecipeCard } from '../features/recipes/components/RecipeCard';
import { useRecipes } from '../features/recipes/hooks';

export function RecipeListPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error } = useRecipes({ page });

  if (isPending) return <p className="muted">Loading recipes…</p>;
  if (isError) return <ErrorBanner error={error as ApiError} />;

  return (
    <section>
      <h1>Recipes</h1>
      {data.items.length === 0 ? (
        <p className="empty-state">
          No recipes yet.{' '}
          <Link to="/recipes/new">Create your first recipe.</Link>
        </p>
      ) : (
        <>
          <ul className="recipe-list">
            {data.items.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </ul>
          <Pager
            page={data.page}
            pageSize={data.page_size}
            total={data.total}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
