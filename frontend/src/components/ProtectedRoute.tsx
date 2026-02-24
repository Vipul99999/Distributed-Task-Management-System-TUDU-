// frontend/src/components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback = <p>Loading...</p> }: Props) {
  const router = useRouter();
  const { accessToken, authReady } = useAuthStore();

  useEffect(() => {
    if (authReady && !accessToken) {
      // Redirect to sign-in page if not authenticated
      router.replace("/signin");
    }
  }, [authReady, accessToken]);

  // Show fallback while checking authentication
  if (!authReady || !accessToken) {
    return fallback;
  }

  return <>{children}</>;
}
