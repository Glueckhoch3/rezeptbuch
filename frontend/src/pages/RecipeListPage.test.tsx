import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecipeListPage } from './RecipeListPage';

const emptyPage = { items: [], page: 1, page_size: 10, total: 0 };

function stubFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(emptyPage),
    } as Response),
  );
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <RecipeListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RecipeListPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows a text search field and no advanced filters by default', () => {
    stubFetch();
    renderPage();

    expect(
      screen.getByPlaceholderText('Search title or description…'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Tag')).not.toBeInTheDocument();
  });

  it('reveals Tag/Allergen/Ingredient filters when "More filters" is opened', async () => {
    stubFetch();
    renderPage();

    await userEvent.click(
      screen.getByRole('button', { name: 'More filters ▾' }),
    );

    expect(screen.getByText('Tag')).toBeInTheDocument();
    expect(screen.getByText('Allergen')).toBeInTheDocument();
    expect(screen.getByText('Ingredient')).toBeInTheDocument();
  });

  it('calls the search endpoint once a text query is entered', async () => {
    stubFetch();
    renderPage();

    await userEvent.type(
      screen.getByPlaceholderText('Search title or description…'),
      'soup',
    );

    expect(
      (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.some(([url]) =>
        String(url).includes('/recipes/search'),
      ),
    ).toBe(true);
  });
});
