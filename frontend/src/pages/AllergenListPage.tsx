import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ApiError } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorBanner } from '../components/ErrorBanner';
import { Pager } from '../components/Pager';
import {
  useAllergens,
  useCreateAllergen,
  useDeleteAllergen,
} from '../features/allergens/hooks';
import type { Allergen } from '../features/allergens/types';

export function AllergenListPage() {
  const [page, setPage] = useState(1);
  const [newName, setNewName] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Allergen | null>(null);
  const { data, isPending, isError, error } = useAllergens({ page });
  const createAllergen = useCreateAllergen();
  const deleteAllergen = useDeleteAllergen();

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      await createAllergen.mutateAsync(name);
      setNewName('');
    } catch {
      // error surfaced via createAllergen.error below
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteAllergen.mutateAsync(pendingDelete.id);
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <section>
      <h1>Allergens</h1>

      <form className="field" onSubmit={handleCreate}>
        <span>Add an allergen</span>
        <div className="inline-form">
          <input
            type="text"
            placeholder="e.g. gluten"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            type="submit"
            className="button button-primary"
            disabled={createAllergen.isPending}
          >
            Add
          </button>
        </div>
      </form>
      {createAllergen.isError && (
        <ErrorBanner error={createAllergen.error as ApiError} />
      )}
      {deleteAllergen.isError && (
        <ErrorBanner error={deleteAllergen.error as ApiError} />
      )}

      {isPending && <p className="muted">Loading allergens…</p>}
      {isError && <ErrorBanner error={error as ApiError} />}

      {data && data.items.length === 0 && (
        <p className="empty-state">No allergens yet.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <ul className="badge-list">
            {data.items.map((allergen) => (
              <li key={allergen.id}>
                <Link
                  to={`/search?allergen=${encodeURIComponent(allergen.name)}`}
                  className="badge badge-allergen"
                >
                  {allergen.name}
                </Link>{' '}
                <button
                  type="button"
                  className="button button-small"
                  aria-label={`delete allergen ${allergen.name}`}
                  onClick={() => setPendingDelete(allergen)}
                >
                  ✕
                </button>
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

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete allergen"
        message={`Delete "${pendingDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
