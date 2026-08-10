export interface PagerProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

// Simple page-number + previous/next pager driven by the backend's
// {items, page, page_size, total} pagination envelope.
export function Pager({ page, pageSize, total, onPageChange }: PagerProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav className="pager" aria-label="Pagination">
      <button
        type="button"
        className="button button-small"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>
      <span className="pager-status">
        Page {page} of {pageCount} ({total} total)
      </span>
      <button
        type="button"
        className="button button-small"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
      >
        Next
      </button>
    </nav>
  );
}
