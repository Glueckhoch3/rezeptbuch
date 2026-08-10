import { Control, useFieldArray, UseFormRegister } from 'react-hook-form';
import { IngredientPicker } from '../../ingredients/components/IngredientPicker';
import type { RecipeFormValues } from '../schema';

interface Props {
  control: Control<RecipeFormValues>;
  register: UseFormRegister<RecipeFormValues>;
}

export function IngredientFieldArray({ control, register }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  return (
    <fieldset className="field-group">
      <legend>Ingredients</legend>
      {fields.map((field, index) => (
        <div className="ingredient-row" key={field.id}>
          <input
            aria-label="amount"
            placeholder="Amount"
            {...register(`ingredients.${index}.amount`)}
          />
          <input
            aria-label="unit"
            placeholder="Unit"
            {...register(`ingredients.${index}.unit`)}
          />
          <IngredientPicker control={control} index={index} />
          <button
            type="button"
            className="button button-small"
            onClick={() => remove(index)}
            aria-label="remove ingredient"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="button button-small"
        onClick={() =>
          append({ ingredientId: null, name: '', amount: '', unit: '' })
        }
      >
        + Add ingredient
      </button>
    </fieldset>
  );
}
