import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, createRecipe, fetchRecipes } from './client';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('api client', () => {
  it('fetches and returns the recipe list', async () => {
    const recipes = [{ id: 1, title: 'A' }];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(recipes),
      }),
    );

    await expect(fetchRecipes()).resolves.toEqual(recipes);
  });

  it('throws an ApiError carrying backend validation details', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: () =>
          Promise.resolve({
            error: 'Validation failed.',
            details: { title: ['Title is required.'] },
          }),
      }),
    );

    await expect(
      createRecipe({
        title: '',
        description: '',
        ingredients: [],
        instructions: [],
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      message: 'Validation failed.',
      details: { title: ['Title is required.'] },
    });
  });

  it('reports a friendly error when the network is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network down')),
    );

    await expect(fetchRecipes()).rejects.toBeInstanceOf(ApiError);
  });
});
