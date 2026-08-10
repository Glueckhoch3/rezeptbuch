// Cross-domain recipe search. Mirrors backend/app/search/router.py.
// Filters combine with AND semantics; tag/ingredient/allergen match by
// exact name (backend uses ilike on the full string, not a substring).

export interface SearchParams {
  tag?: string;
  ingredient?: string;
  allergen?: string;
  q?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | undefined;
}
