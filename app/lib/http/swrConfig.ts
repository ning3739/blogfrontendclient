import type { SWRConfiguration } from "swr";
import httpClient from "./client";
import fetcher from "./fetcher";

// Error codes that should not trigger retry (deterministic failures)
const NO_RETRY_STATUS = new Set([401, 403, 404]);

export const swrConfig: SWRConfiguration = {
  fetcher,

  // Revalidation
  revalidateOnFocus: false,
  revalidateOnReconnect: true,

  // Error retry
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  shouldRetryOnError: (error) => !NO_RETRY_STATUS.has(error?.status),

  // Performance
  dedupingInterval: 2000,
  focusThrottleInterval: 5000,
};

// Revalidate all data when locale changes
if (typeof window !== "undefined") {
  let pending: Promise<unknown> | null = null;

  httpClient.addLocaleChangeListener(() => {
    if (pending) return;

    pending = import("swr")
      .then(({ mutate }) => mutate(() => true, undefined, { revalidate: true }))
      .finally(() => {
        pending = null;
      });
  });
}
