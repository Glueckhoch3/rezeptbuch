import { useSearchParams } from 'react-router-dom';
import type { ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { Pager } from '../components/Pager';
import { RecipeCard } from '../features/recipes/components/RecipeCard';
import { SearchFilters } from '../features/search/components/SearchFilters';
import { useSearchRecipes } from '../features/search/hooks';
import type { SearchParams } from '../features/search/types';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: SearchParams = {
    tag: searchParams.get('tag') ?? undefined,
    ingredient: searchParams.get('ingredient') ?? undefined,
    allergen: searchParams.get('allergen') ?? undefined,
    q: searchParams.get('q') ?? undefined,
    page: Number(searchParams.get('page') ?? '1'),
  };

  const { data, isPending, isError, error } = useSearchRecipes(filters);
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

  return (
    <section>
      <h1>Search recipes</h1>
      <SearchFilters value={filters} onChange={updateFilters} />

      {!hasFilter && (
        <p className="empty-state">Choose at least one filter to search.</p>
      )}
      {hasFilter && isPending && <p className="muted">Searching…</p>}
      {hasFilter && isError && <ErrorBanner error={error as ApiError} />}
      {hasFilter && data && data.items.length === 0 && (
        <p className="empty-state">No recipes match this search.</p>
      )}
      {hasFilter && data && data.items.length > 0 && (
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
