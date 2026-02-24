"use client";

import { useEffect, useState } from "react";
import Dashboard from "./dashboard/page";
import { initializeAccessToken } from "@/lib/api/authApi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initToken() {
      try {
        await initializeAccessToken();
      } catch (err) {
        console.error("[Home] Failed to initialize token:", err);
        setError("Failed to authenticate. Please sign in.");
      } finally {
        setLoading(false);
      }
    }
    initToken();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error)
    return (
      <div style={{ padding: 20, color: "red" }}>
        <h2>Error</h2>
        <p>{error}</p>
        <p>
          Please <a href="/signin">sign in</a> to continue.
        </p>
      </div>
    );

  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
