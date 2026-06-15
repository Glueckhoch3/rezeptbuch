import { FormEvent, useState } from 'react';
import type { ApiError } from '../api/client';
import type { Ingredient, Instruction, RecipeInput } from '../types';
import { ErrorBanner } from './ErrorBanner';

interface Props {
  initial?: RecipeInput;
  submitLabel: string;
  submitting: boolean;
  error: ApiError | null;
  onSubmit: (input: RecipeInput) => void;
  onCancel: () => void;
}

const emptyIngredient = (): Ingredient => ({ amount: '', unit: '', name: '' });
const emptyInstruction = (): Instruction => ({ text: '' });

const defaultInput = (): RecipeInput => ({
  title: '',
  description: '',
  ingredients: [emptyIngredient()],
  instructions: [emptyInstruction()],
});

// Shared create/edit form. It owns local form state and performs basic
// client-side validation, but the backend remains the source of truth.
export function RecipeForm({
  initial,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<RecipeInput>(
    () => initial ?? defaultInput(),
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const updateIngredient = (
    index: number,
    key: keyof Ingredient,
    value: string,
  ) => {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) =>
        i === index ? { ...ing, [key]: value } : ing,
      ),
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setForm((f) => ({
      ...f,
      instructions: f.instructions.map((ins, i) =>
        i === index ? { ...ins, text: value } : ins,
      ),
    }));
  };

  const addIngredient = () =>
    setForm((f) => ({
      ...f,
      ingredients: [...f.ingredients, emptyIngredient()],
    }));
  const removeIngredient = (index: number) =>
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, i) => i !== index),
    }));

  const addInstruction = () =>
    setForm((f) => ({
      ...f,
      instructions: [...f.instructions, emptyInstruction()],
    }));
  const removeInstruction = (index: number) =>
    setForm((f) => ({
      ...f,
      instructions: f.instructions.filter((_, i) => i !== index),
    }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setClientError(null);

    const cleaned: RecipeInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      ingredients: form.ingredients
        .map((i) => ({ ...i, name: i.name.trim() }))
        .filter((i) => i.name !== ''),
      instructions: form.instructions
        .map((i) => ({ ...i, text: i.text.trim() }))
        .filter((i) => i.text !== ''),
    };

    if (!cleaned.title) {
      setClientError('Please enter a title.');
      return;
    }
    if (cleaned.ingredients.length === 0) {
      setClientError('Please add at least one ingredient with a name.');
      return;
    }
    if (cleaned.instructions.length === 0) {
      setClientError('Please add at least one instruction.');
      return;
    }

    onSubmit(cleaned);
  };

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <ErrorBanner error={error} />
      {clientError && (
        <div className="error-banner" role="alert">
          {clientError}
        </div>
      )}

      <label className="field">
        <span>Title</span>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Tomato soup"
        />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          value={form.description}
          rows={3}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="A short description"
        />
      </label>

      <fieldset className="field-group">
        <legend>Ingredients</legend>
        {form.ingredients.map((ing, index) => (
          <div className="ingredient-row" key={index}>
            <input
              aria-label="amount"
              className="input-amount"
              placeholder="Amount"
              value={ing.amount}
              onChange={(e) =>
                updateIngredient(index, 'amount', e.target.value)
              }
            />
            <input
              aria-label="unit"
              className="input-unit"
              placeholder="Unit"
              value={ing.unit}
              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
            />
            <input
              aria-label="ingredient name"
              className="input-name"
              placeholder="Ingredient"
              value={ing.name}
              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
            />
            <button
              type="button"
              className="button button-small"
              onClick={() => removeIngredient(index)}
              aria-label="remove ingredient"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button button-small"
          onClick={addIngredient}
        >
          + Add ingredient
        </button>
      </fieldset>

      <fieldset className="field-group">
        <legend>Instructions</legend>
        {form.instructions.map((ins, index) => (
          <div className="instruction-row" key={index}>
            <span className="step-number">{index + 1}.</span>
            <textarea
              aria-label={`instruction ${index + 1}`}
              rows={2}
              placeholder="Describe this step"
              value={ins.text}
              onChange={(e) => updateInstruction(index, e.target.value)}
            />
            <button
              type="button"
              className="button button-small"
              onClick={() => removeInstruction(index)}
              aria-label="remove instruction"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button button-small"
          onClick={addInstruction}
        >
          + Add step
        </button>
      </fieldset>

      <div className="form-actions">
        <button type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="button button-primary"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
