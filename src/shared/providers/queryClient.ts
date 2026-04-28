import { QueryClient } from "@tanstack/react-query";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Shared React Query client configuration for both client-side providers and
 * server-side prefetch/hydration.
 *
 * Most authenticated app data changes infrequently and is either updated by
 * explicit mutations or synchronized through realtime subscriptions. We keep
 * hydrated queries warm for longer so returning to a project view does not
 * trigger avoidable refetch cascades after a few minutes.
 */
export const createAppQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: ONE_DAY_IN_MS,
        gcTime: ONE_DAY_IN_MS,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
};
