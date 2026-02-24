// src/hooks/useCurrentUser.ts
"use client";

import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import { useAuthStore } from "@/stores/useAuthStore";

export interface CurrentUser {
  userId: string;
  role: string;
  exp: number;
  iat: number;
}

export function useCurrentUser() {
  const { accessToken, loading } = useAuthStore();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      console.log("[useCurrentUser] No access token available yet");
      setUser(null);
      setIsLoggedIn(false);
      return;
    }

    try {
      const decoded = jwtDecode<CurrentUser>(accessToken);
      setUser(decoded);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("[useCurrentUser] Failed to decode access token:", err);
      setUser(null);
      setIsLoggedIn(false);
    }
  }, [accessToken]);

  return { user, isLoggedIn, loading };
}
