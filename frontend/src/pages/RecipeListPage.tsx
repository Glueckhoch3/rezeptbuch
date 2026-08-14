import { Link, useSearchParams } from 'react-router-dom';
import type { ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { Pager } from '../components/Pager';
import { RecipeCard } from '../features/recipes/components/RecipeCard';
import { useRecipes } from '../features/recipes/hooks';
import { SearchFilters } from '../features/search/components/SearchFilters';
import { useSearchRecipes } from '../features/search/hooks';
import type { SearchParams } from '../features/search/types';

// Landing page: browses all recipes by default, and doubles as the search
// page once any filter is set (text/tag/allergen/ingredient), so there's a
// single place — not a separate route — for "look at recipes".
export function RecipeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: SearchParams = {
    tag: searchParams.get('tag') ?? undefined,
    ingredient: searchParams.get('ingredient') ?? undefined,
    allergen: searchParams.get('allergen') ?? undefined,
    q: searchParams.get('q') ?? undefined,
    page: Number(searchParams.get('page') ?? '1'),
  };
  const hasFilter = Boolean(
    filters.tag || filters.ingredient || filters.allergen || filters.q,
  );

  const updateFilters = (next: SearchParams) => {
    const params = new URLSearchParams();
    if (next.tag) params.set('tag', next.tag);
    if (next.ingredient) params.set('ingredient', next.ingredient);
    if (next.allergen) params.set('allergen', next.allergen);
    if (next.q) params.set('q', next.q);
    if (next.page && next.page > 1) params.set('page', String(next.page));
    setSearchParams(params);
  };

  const recipesQuery = useRecipes({ page: filters.page });
  const searchQuery = useSearchRecipes(filters);
  const { data, isPending, isError, error } = hasFilter
    ? searchQuery
    : recipesQuery;

  return (
    <section>
      <h1>Recipes</h1>
      <SearchFilters value={filters} onChange={updateFilters} />

      {isPending && <p className="muted">Loading recipes…</p>}
      {isError && <ErrorBanner error={error as ApiError} />}
      {!isPending && !isError && data && data.items.length === 0 && (
        <p className="empty-state">
          {hasFilter ? (
            'No recipes match this search.'
          ) : (
            <>
              No recipes yet.{' '}
              <Link to="/recipes/new">Create your first recipe.</Link>
            </>
          )}
        </p>
      )}
      {!isPending && !isError && data && data.items.length > 0 && (
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
            onPageChange={(page) => updateFilters({ ...filters, page })}
          />
        </>
      )}
    </section>
  );
}
