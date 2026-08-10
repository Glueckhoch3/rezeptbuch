import { QueryClient } from '@tanstack/react-query';

// Single shared QueryClient instance. Server errors already carry a
// human-readable message (see ApiError in client.ts), so a short retry
// count avoids masking real failures behind a long spinner.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
