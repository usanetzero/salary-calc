"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryFunction,
} from "@tanstack/react-query";
import { useState } from "react";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const res = await fetch(queryKey.join("/") as string, {
    credentials: "include",
  });
  await throwIfResNotOk(res);
  return await res.json();
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            queryFn: defaultQueryFn,
            refetchInterval: false,
            refetchOnWindowFocus: false,
            staleTime: Infinity,
            retry: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
