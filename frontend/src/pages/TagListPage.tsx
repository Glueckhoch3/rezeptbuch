import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ApiError } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorBanner } from '../components/ErrorBanner';
import { Pager } from '../components/Pager';
import { useCreateTag, useDeleteTag, useTags } from '../features/tags/hooks';
import type { Tag } from '../features/tags/types';

export function TagListPage() {
  const [page, setPage] = useState(1);
  const [newName, setNewName] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);
  const { data, isPending, isError, error } = useTags({ page });
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      await createTag.mutateAsync(name);
      setNewName('');
    } catch {
      // error surfaced via createTag.error below
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteTag.mutateAsync(pendingDelete.id);
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <section>
      <h1>Tags</h1>

      <form className="field" onSubmit={handleCreate}>
        <span>Add a tag</span>
        <div className="inline-form">
          <input
            type="text"
            placeholder="e.g. vegetarian"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            type="submit"
            className="button button-primary"
            disabled={createTag.isPending}
          >
            Add
          </button>
        </div>
      </form>
      {createTag.isError && <ErrorBanner error={createTag.error as ApiError} />}
      {deleteTag.isError && <ErrorBanner error={deleteTag.error as ApiError} />}

      {isPending && <p className="muted">Loading tags…</p>}
      {isError && <ErrorBanner error={error as ApiError} />}

      {data && data.items.length === 0 && (
        <p className="empty-state">No tags yet.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <ul className="badge-list">
            {data.items.map((tag) => (
              <li key={tag.id}>
                <Link
                  to={`/search?tag=${encodeURIComponent(tag.name)}`}
                  className="badge"
                >
                  {tag.name}
                </Link>{' '}
                <button
                  type="button"
                  className="button button-small"
                  aria-label={`delete tag ${tag.name}`}
                  onClick={() => setPendingDelete(tag)}
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
        title="Delete tag"
        message={`Delete "${pendingDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
