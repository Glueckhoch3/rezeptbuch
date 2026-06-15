import type { ApiError } from '../api/client';

interface Props {
  error: ApiError | null;
}

// Surfaces a backend error message plus any per-field validation details so
// users see exactly why a request failed.
export function ErrorBanner({ error }: Props) {
  if (!error) return null;

  const fieldMessages = Object.entries(error.details).flatMap(
    ([field, value]) => {
      const messages = Array.isArray(value) ? value : [String(value)];
      return messages.map((m) => `${field}: ${m}`);
    },
  );

  return (
    <div className="error-banner" role="alert">
      <strong>{error.message}</strong>
      {fieldMessages.length > 0 && (
        <ul>
          {fieldMessages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
