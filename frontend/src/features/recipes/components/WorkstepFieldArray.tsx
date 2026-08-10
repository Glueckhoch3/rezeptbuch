import { Control, useFieldArray, UseFormRegister } from 'react-hook-form';
import type { RecipeFormValues } from '../schema';

interface Props {
  control: Control<RecipeFormValues>;
  register: UseFormRegister<RecipeFormValues>;
}

export function WorkstepFieldArray({ control, register }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'worksteps',
  });

  return (
    <fieldset className="field-group">
      <legend>Worksteps</legend>
      {fields.map((field, index) => (
        <div className="instruction-row" key={field.id}>
          <span className="step-number">{index + 1}.</span>
          <div className="workstep-fields">
            <input
              aria-label={`workstep ${index + 1} title`}
              placeholder="Step title"
              {...register(`worksteps.${index}.title`)}
            />
            <textarea
              aria-label={`workstep ${index + 1} description`}
              rows={2}
              placeholder="Describe this step"
              {...register(`worksteps.${index}.description`)}
            />
          </div>
          <button
            type="button"
            className="button button-small"
            onClick={() => remove(index)}
            aria-label="remove workstep"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="button button-small"
        onClick={() => append({ title: '', description: '' })}
      >
        + Add step
      </button>
    </fieldset>
  );
}
