// Dedicated API client layer. Components never call fetch directly; they go
// through these functions so the backend contract lives in one place.

import type { Recipe, RecipeInput } from '../types';

// In development Vite proxies "/api" to the backend. In other environments the
// base URL can be overridden via VITE_API_BASE_URL.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Error carrying the parsed backend message and per-field validation details.
export class ApiError extends Error {
  details: Record<string, unknown>;
  status: number;

  constructor(
    message: string,
    status: number,
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    const headers = new Headers(options.headers);
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      'Could not reach the server. Is the backend running?',
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (body as { error?: string }).error ??
      `Request failed (${response.status})`;
    const details =
      (body as { details?: Record<string, unknown> }).details ?? {};
    throw new ApiError(message, response.status, details);
  }

  return body as T;
}

export function fetchRecipes(): Promise<Recipe[]> {
  return request<Recipe[]>('/recipes');
}

export function fetchRecipe(id: number): Promise<Recipe> {
  return request<Recipe>(`/recipes/${id}`);
}

export function createRecipe(input: RecipeInput): Promise<Recipe> {
  return request<Recipe>('/recipes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateRecipe(id: number, input: RecipeInput): Promise<Recipe> {
  return request<Recipe>(`/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteRecipe(id: number): Promise<void> {
  return request<void>(`/recipes/${id}`, { method: 'DELETE' });
}
