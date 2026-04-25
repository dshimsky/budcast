import { focusManager, QueryClient } from "@tanstack/react-query";

export function createBudCastQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false
      }
    }
  });
}

export function bindNativeQueryFocus(
  addEventListener: (
    type: "change",
    listener: (status: string) => void
  ) => { remove: () => void }
) {
  const subscription = addEventListener("change", (status) => {
    focusManager.setFocused(status === "active");
  });

  return () => {
    subscription.remove();
  };
}
