// Dedicated API client layer. Feature modules (features/*/api.ts) never call
// fetch directly; they go through this wrapper so the backend contract lives
// in one place.

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

// Envelope shared by every paginated list endpoint:
// {"items": [...], "page": n, "page_size": n, "total": n}
export interface Page<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}

// Builds a "?key=value&..." query string, dropping undefined/empty values so
// callers can pass optional filter objects directly.
export function toQueryString(
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
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
