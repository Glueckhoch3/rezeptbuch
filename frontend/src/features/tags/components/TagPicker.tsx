import { KeyboardEvent, useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { RecipeFormValues } from '../../recipes/schema';
import { useTags } from '../hooks';

interface Props {
  control: Control<RecipeFormValues>;
}

// Server-side debounced tag autocomplete plus free-text entry (Enter or
// comma adds the typed value) — the backend resolves-or-creates tags by name.
export function TagPicker({ control }: Props) {
  const { field } = useController({ control, name: 'tags' });
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 250);
  const { data } = useTags({ q: debouncedQuery, page_size: 10 });
  const suggestions = (data?.items ?? []).filter(
    (tag) => !field.value.includes(tag.name),
  );

  const addTag = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || field.value.includes(trimmed)) return;
    field.onChange([...field.value, trimmed]);
    setQuery('');
    setOpen(false);
  };

  const removeTag = (name: string) => {
    field.onChange(field.value.filter((tag) => tag !== name));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(query);
    }
  };

  return (
    <div className="picker">
      {field.value.length > 0 && (
        <ul className="badge-list">
          {field.value.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                className="badge"
                onClick={() => removeTag(tag)}
              >
                {tag} ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        aria-label="add tag"
        placeholder="Add a tag and press Enter"
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && suggestions.length > 0 && (
        <ul className="picker-suggestions">
          {suggestions.map((tag) => (
            <li key={tag.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(tag.name)}
              >
                {tag.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
