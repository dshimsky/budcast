"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, createBudCastQueryClient } from "@budcast/shared";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createBudCastQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
