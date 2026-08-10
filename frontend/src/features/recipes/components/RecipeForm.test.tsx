import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RecipeForm } from './RecipeForm';

const noop = () => {};

function renderForm(props: Partial<ComponentProps<typeof RecipeForm>> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RecipeForm
        submitLabel="Create"
        submitting={false}
        error={null}
        onSubmit={noop}
        onCancel={noop}
        {...props}
      />
    </QueryClientProvider>,
  );
}

describe('RecipeForm', () => {
  it('blocks submission and shows an error when the title is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ items: [], page: 1, page_size: 10, total: 0 }),
      }),
    );
    const onSubmit = vi.fn();
    renderForm({ onSubmit });

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText('Title is required.')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('submits cleaned data when the form is valid', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ items: [], page: 1, page_size: 10, total: 0 }),
      }),
    );
    const onSubmit = vi.fn();
    renderForm({ onSubmit });

    await userEvent.type(
      screen.getByPlaceholderText('e.g. Tomato soup'),
      'Soup',
    );
    await userEvent.type(screen.getByLabelText('ingredient name'), 'Water');
    await userEvent.type(screen.getByLabelText('workstep 1 title'), 'Boil');
    await userEvent.type(
      screen.getByLabelText('workstep 1 description'),
      'Boil the water',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Soup',
      description: '',
      origin: null,
      tags: [],
      ingredients: [{ name: 'Water', amount: '', unit: '' }],
      worksteps: [{ title: 'Boil', description: 'Boil the water' }],
    });
    vi.unstubAllGlobals();
  });

  it('can add and remove ingredient rows', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ items: [], page: 1, page_size: 10, total: 0 }),
      }),
    );
    renderForm();

    expect(screen.getAllByLabelText('ingredient name')).toHaveLength(1);
    await userEvent.click(
      screen.getByRole('button', { name: '+ Add ingredient' }),
    );
    expect(screen.getAllByLabelText('ingredient name')).toHaveLength(2);
    await userEvent.click(screen.getAllByLabelText('remove ingredient')[0]);
    expect(screen.getAllByLabelText('ingredient name')).toHaveLength(1);
    vi.unstubAllGlobals();
  });
});
