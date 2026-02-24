// src/stores/useUserStore.ts
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import api from "@/lib/api/authApi";

export interface User {
  public_id: string;
  email: string;
  name: string;
  role: string;
  email_verified: boolean;
}

interface UserStore {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  subscribeWithSelector((set) => ({
    user: null,
    loading: false,

    setUser: (user) => {
      set({ user });
      if (typeof window !== "undefined") {
        if (user) sessionStorage.setItem("user", JSON.stringify(user));
        else sessionStorage.removeItem("user");
      }
    },

    fetchUser: async () => {
      set({ loading: true });
      try {
        const res = await api.get("/api/users"); // requires valid access token
        if (res.data?.success && res.data.user) {
          set({ user: res.data.user });
          if (typeof window !== "undefined") {
            sessionStorage.setItem("user", JSON.stringify(res.data.user));
          }
        } else {
          set({ user: null });
          if (typeof window !== "undefined") sessionStorage.removeItem("user");
        }
      } catch (err) {
        console.error("[UserStore] fetchUser error:", err);
        set({ user: null });
        if (typeof window !== "undefined") sessionStorage.removeItem("user");
      } finally {
        set({ loading: false });
      }
    },

    refreshUser: async () => {
      await useUserStore.getState().fetchUser();
    },
  }))
);

// --- Hydrate user from sessionStorage ---
if (typeof window !== "undefined") {
  const storedUser = sessionStorage.getItem("user");
  if (storedUser) {
    try {
      useUserStore.setState({ user: JSON.parse(storedUser) });
    } catch (err) {
      console.error("[UserStore] Failed to parse stored user:", err);
      sessionStorage.removeItem("user");
    }
  }

  // --- Sync user across tabs ---
  window.addEventListener("storage", (e) => {
    if (e.key === "user") {
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : null;
        useUserStore.getState().setUser(parsed);
      } catch {
        useUserStore.getState().setUser(null);
      }
    }
  });
}
