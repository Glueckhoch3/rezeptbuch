import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeForm } from './RecipeForm';

const noop = () => {};

describe('RecipeForm', () => {
  it('blocks submission and shows an error when the title is empty', async () => {
    const onSubmit = vi.fn();
    render(
      <RecipeForm
        submitLabel="Create"
        submitting={false}
        error={null}
        onSubmit={onSubmit}
        onCancel={noop}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Please enter a title.')).toBeInTheDocument();
  });

  it('submits cleaned data when the form is valid', async () => {
    const onSubmit = vi.fn();
    render(
      <RecipeForm
        submitLabel="Create"
        submitting={false}
        error={null}
        onSubmit={onSubmit}
        onCancel={noop}
      />,
    );

    await userEvent.type(
      screen.getByPlaceholderText('e.g. Tomato soup'),
      'Soup',
    );
    await userEvent.type(screen.getByLabelText('ingredient name'), 'Water');
    await userEvent.type(screen.getByLabelText('instruction 1'), 'Boil it');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Soup',
      description: '',
      ingredients: [{ amount: '', unit: '', name: 'Water' }],
      instructions: [{ text: 'Boil it' }],
    });
  });

  it('can add and remove ingredient rows', async () => {
    render(
      <RecipeForm
        submitLabel="Create"
        submitting={false}
        error={null}
        onSubmit={noop}
        onCancel={noop}
      />,
    );

    expect(screen.getAllByLabelText('ingredient name')).toHaveLength(1);
    await userEvent.click(
      screen.getByRole('button', { name: '+ Add ingredient' }),
    );
    expect(screen.getAllByLabelText('ingredient name')).toHaveLength(2);
    await userEvent.click(screen.getAllByLabelText('remove ingredient')[0]);
    expect(screen.getAllByLabelText('ingredient name')).toHaveLength(1);
  });
});
