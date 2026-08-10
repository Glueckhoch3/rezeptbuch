import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, request, toQueryString } from './client';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('toQueryString', () => {
  it('builds a query string, dropping undefined and empty values', () => {
    expect(
      toQueryString({ q: 'flour', page: 2, unit: '', missing: undefined }),
    ).toBe('?q=flour&page=2');
  });

  it('returns an empty string when nothing is set', () => {
    expect(toQueryString({})).toBe('');
  });
});

describe('request', () => {
  it('resolves with the parsed JSON body on success', async () => {
    const body = { id: '1', title: 'A' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(body),
      }),
    );

    await expect(request('/recipes/1')).resolves.toEqual(body);
  });

  it('resolves with undefined on a 204 No Content response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      }),
    );

    await expect(
      request('/recipes/1', { method: 'DELETE' }),
    ).resolves.toBeUndefined();
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
      request('/recipes', { method: 'POST', body: JSON.stringify({}) }),
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

    await expect(request('/recipes')).rejects.toBeInstanceOf(ApiError);
  });
});
