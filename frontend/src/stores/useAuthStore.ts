// src/stores/useAuthStore.ts
import { create } from "zustand";
import axios from "axios";

console.log("in stores useAuthService ", process.env.NEXT_PUBLIC_AUTH_SERVICE_URL);
interface AuthState {
  accessToken: string | null;
  loading: boolean;
  authReady: boolean; // flag to indicate store is initialized
  setAccessToken: (token: string | null) => void;
  fetchAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  loading: true,
  authReady: false,

  setAccessToken: (token) => {
    set({ accessToken: token });
    if (typeof window !== "undefined") {
      if (token) sessionStorage.setItem("accessToken", token);
      else sessionStorage.removeItem("accessToken");
    }
  },

  fetchAccessToken: async () => {
    set({ loading: true });
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/api/refresh_token`,
        {},
        { withCredentials: true } // send httpOnly cookie
      );

      if (res.data.success && res.data.accessToken) {
        set({ accessToken: res.data.accessToken });
        if (typeof window !== "undefined") {
          sessionStorage.setItem("accessToken", res.data.accessToken);
        }
      } else {
        set({ accessToken: null });
        if (typeof window !== "undefined") sessionStorage.removeItem("accessToken");
      }
    } catch (err) {
      console.error("[AuthStore] fetchAccessToken error:", err);
      set({ accessToken: null });
      if (typeof window !== "undefined") sessionStorage.removeItem("accessToken");
    } finally {
      set({ loading: false, authReady: true });
    }
  },
}));

// --- Hydrate on page load ---
if (typeof window !== "undefined") {
  (async () => {
    const storedToken = sessionStorage.getItem("accessToken");
    if (storedToken) {
      useAuthStore.getState().setAccessToken(storedToken);
      useAuthStore.setState({ authReady: true, loading: false });
    } else {
      try {
        await useAuthStore.getState().fetchAccessToken();
      } catch (err) {
        console.warn("[AuthStore] Failed to fetch access token on load:", err);
        useAuthStore.setState({ authReady: true, loading: false });
      }
    }

    // --- Sync across tabs ---
    window.addEventListener("storage", (e) => {
      if (e.key === "accessToken") {
        useAuthStore.getState().setAccessToken(e.newValue);
      }
    });
  })();
}
