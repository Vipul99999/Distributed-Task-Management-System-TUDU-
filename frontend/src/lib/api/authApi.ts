// src/lib/api/authApi.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import {jwtDecode, JwtPayload } from "jwt-decode";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import Router from "next/router";

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let refreshQueue: ((token: string | null) => void)[] = [];
let refreshTimeout: NodeJS.Timeout | null = null;

// -------------------- Access Token Helpers --------------------
export function setAccessToken(token: string) {
  useAuthStore.setState({ accessToken: token });
  if (typeof window !== "undefined" && token) sessionStorage.setItem("accessToken", token);
  scheduleTokenRefresh(token);
}

export function clearAccessToken() {
  useAuthStore.setState({ accessToken: null });
  useUserStore.getState().setUser(null);
  if (typeof window !== "undefined") sessionStorage.removeItem("accessToken");
  if (refreshTimeout) clearTimeout(refreshTimeout);
}

export function getAccessTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("accessToken");
}

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload & { exp: number }>(token);
    if (!decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// -------------------- Preemptive Token Refresh --------------------
function scheduleTokenRefresh(token: string) {
  if (refreshTimeout) clearTimeout(refreshTimeout);

  try {
    const decoded = jwtDecode<JwtPayload & { exp: number }>(token);
    if (!decoded.exp) return;

    const expiresIn = decoded.exp * 1000 - Date.now();
    const refreshTime = expiresIn - 2 * 60 * 1000; // 2 min before expiry

   
    if (refreshTime <= 0) {
      refreshAccessTokenSilently();
      return;
    }

    refreshTimeout = setTimeout(() => {
      refreshAccessTokenSilently();
    }, refreshTime);
  } catch (err) {
    console.error("[API] scheduleTokenRefresh → failed to decode token:", err);
  }
}

// -------------------- Silent Refresh --------------------
async function refreshAccessTokenSilently(): Promise<void> {
  if (isRefreshing) return;
  isRefreshing = true;

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/api/refresh_token`,
      {},
      { withCredentials: true }
    );

    if (res.data?.success && res.data.accessToken) {
     
      setAccessToken(res.data.accessToken);

      // Update queued requests
      refreshQueue.forEach((cb) => cb(res.data.accessToken));
      refreshQueue = [];
    } else {
     
      clearAccessToken();
      refreshQueue.forEach((cb) => cb(null));
      refreshQueue = [];
    }
  } catch (err) {
    console.error("[API] refreshAccessTokenSilently → error:", err);
    clearAccessToken();
    refreshQueue.forEach((cb) => cb(null));
    refreshQueue = [];
  } finally {
    isRefreshing = false;

    // Redirect if no access token exists
    if (!useAuthStore.getState().accessToken && typeof window !== "undefined") {
      setTimeout(() => Router.push("/signin"), 1000);
    }

    console.log("[API] refreshAccessTokenSilently → end");
  }
}

// -------------------- Initialize Token on Page Load --------------------
export async function initializeAccessToken(): Promise<void> {
  const token = useAuthStore.getState().accessToken || getAccessTokenFromStorage();

  if (!token) {
    console.log("[API] initializeAccessToken → no token found");
    return;
  }

  if (isTokenExpired(token)) {
    console.log("[API] initializeAccessToken → token expired, refreshing...");
    await refreshAccessTokenSilently();
  } else {
    console.log("[API] initializeAccessToken → valid token found, setting...");
    setAccessToken(token);
  }
}

// -------------------- Axios Instance --------------------
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
  withCredentials: true, // sends refresh token cookie
});

// -------------------- Request Interceptor --------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken || getAccessTokenFromStorage();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// -------------------- Response Interceptor --------------------
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as CustomRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token: string | null) => {
            if (!token) return reject(error);
            originalRequest.headers = originalRequest.headers || {};
            (originalRequest.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      await refreshAccessTokenSilently();
      const token = useAuthStore.getState().accessToken;
      if (!token) return Promise.reject(error);

      originalRequest.headers = originalRequest.headers || {};
      (originalRequest.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
