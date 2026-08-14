import { useState } from 'react';
import { useAllergens } from '../../allergens/hooks';
import { useTags } from '../../tags/hooks';
import type { SearchParams } from '../types';

interface Props {
  value: SearchParams;
  onChange: (value: SearchParams) => void;
}

// Text search stays visible at all times; Tag/Allergen/Ingredient live in a
// collapsible "more filters" panel the user opts into. Tag/allergen filters
// use a <select> populated from the master lists so the value sent to the
// backend is always an exact name — the search endpoint matches
// tag/ingredient/allergen by exact (case-insensitive) name, not a substring,
// unlike the free-text `q` filter.
export function SearchFilters({ value, onChange }: Props) {
  const { data: tags } = useTags({ page_size: 100 });
  const { data: allergens } = useAllergens({ page_size: 100 });
  const [open, setOpen] = useState(false);

  const update = (patch: Partial<SearchParams>) => {
    onChange({ ...value, ...patch, page: 1 });
  };

  const advancedActive = Boolean(
    value.tag || value.allergen || value.ingredient,
  );

  return (
    <div className="search-filters">
      <div className="search-filters-bar">
        <label className="field search-filters-text">
          <span>Text</span>
          <input
            type="search"
            placeholder="Search title or description…"
            value={value.q ?? ''}
            onChange={(e) => update({ q: e.target.value || undefined })}
          />
        </label>

        <button
          type="button"
          className="button search-filters-toggle"
          aria-expanded={open}
          aria-controls="search-filters-advanced"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Hide filters ▲' : 'More filters ▾'}
          {!open && advancedActive && (
            <span className="badge search-filters-badge">active</span>
          )}
        </button>
      </div>

      {open && (
        <div id="search-filters-advanced" className="search-filters-advanced">
          <label className="field">
            <span>Tag</span>
            <select
              value={value.tag ?? ''}
              onChange={(e) => update({ tag: e.target.value || undefined })}
            >
              <option value="">Any tag</option>
              {tags?.items.map((tag) => (
                <option key={tag.id} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Allergen</span>
            <select
              value={value.allergen ?? ''}
              onChange={(e) =>
                update({ allergen: e.target.value || undefined })
              }
            >
              <option value="">Any allergen</option>
              {allergens?.items.map((allergen) => (
                <option key={allergen.id} value={allergen.name}>
                  {allergen.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Ingredient</span>
            <input
              type="text"
              placeholder="Exact ingredient name…"
              value={value.ingredient ?? ''}
              onChange={(e) =>
                update({ ingredient: e.target.value || undefined })
              }
            />
          </label>
        </div>
      )}
    </div>
  );
}
