import { useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { RecipeFormValues } from '../../recipes/schema';
import { useIngredientSearch } from '../hooks';

interface Props {
  control: Control<RecipeFormValues>;
  index: number;
}

// Server-side debounced ingredient autocomplete. Selecting a suggestion
// links the row to an existing master ingredient (ingredient_id); typing a
// name that doesn't match falls through to the backend's resolve-or-create
// by name, so free text always stays a valid submission.
export function IngredientPicker({ control, index }: Props) {
  const idField = useController({
    control,
    name: `ingredients.${index}.ingredientId`,
  });
  const nameField = useController({
    control,
    name: `ingredients.${index}.name`,
  });
  const [open, setOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(nameField.field.value, 250);
  const { data } = useIngredientSearch(debouncedQuery);
  const matches = data?.items ?? [];

  const handleChange = (value: string) => {
    idField.field.onChange(null);
    nameField.field.onChange(value);
    setOpen(true);
  };

  const handleSelect = (id: string, name: string) => {
    idField.field.onChange(id);
    nameField.field.onChange(name);
    setOpen(false);
  };

  return (
    <div className="picker">
      <input
        aria-label="ingredient name"
        className="input-name"
        placeholder="Ingredient"
        autoComplete="off"
        value={nameField.field.value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          nameField.field.onBlur();
          setTimeout(() => setOpen(false), 150);
        }}
      />
      {open && matches.length > 0 && (
        <ul className="picker-suggestions">
          {matches.map((ingredient) => (
            <li key={ingredient.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(ingredient.id, ingredient.name)}
              >
                {ingredient.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
