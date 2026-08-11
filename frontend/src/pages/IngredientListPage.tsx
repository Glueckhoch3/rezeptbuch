import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { Pager } from '../components/Pager';
import {
  useCreateIngredient,
  useIngredients,
} from '../features/ingredients/hooks';

export function IngredientListPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [newName, setNewName] = useState('');
  const { data, isPending, isError, error } = useIngredients({ q, page });
  const createIngredient = useCreateIngredient();

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      await createIngredient.mutateAsync({ name });
      setNewName('');
    } catch {
      // error surfaced via createIngredient.error below
    }
  };

  return (
    <section>
      <h1>Ingredients</h1>

      <form className="field" onSubmit={handleCreate}>
        <span>Add an ingredient</span>
        <div className="inline-form">
          <input
            type="text"
            placeholder="e.g. Flour"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            type="submit"
            className="button button-primary"
            disabled={createIngredient.isPending}
          >
            Add
          </button>
        </div>
      </form>
      {createIngredient.isError && (
        <ErrorBanner error={createIngredient.error as ApiError} />
      )}

      <label className="field">
        <span>Search</span>
        <input
          type="search"
          placeholder="Search ingredients…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
      </label>

      {isPending && <p className="muted">Loading ingredients…</p>}
      {isError && <ErrorBanner error={error as ApiError} />}

      {data && data.items.length === 0 && (
        <p className="empty-state">No ingredients match this search.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <ul className="recipe-list">
            {data.items.map((ingredient) => (
              <li key={ingredient.id} className="recipe-card">
                <Link
                  to={`/ingredients/${ingredient.id}`}
                  className="recipe-card-title"
                >
                  {ingredient.name}
                </Link>
                {ingredient.allergens.length > 0 && (
                  <ul className="badge-list">
                    {ingredient.allergens.map((allergen) => (
                      <li key={allergen.id}>
                        <span className="badge badge-allergen">
                          {allergen.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
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
