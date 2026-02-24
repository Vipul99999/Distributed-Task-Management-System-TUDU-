// src/lib/api/apiClient.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Creates a preconfigured Axios instance for a given microservice base URL.
 * Adds Authorization header from accessToken in AuthStore.
 */
export function createApi(baseURL: string): AxiosInstance {
  const api = axios.create({
    baseURL,
    withCredentials: true,
  });

  // -------------------- Request Interceptor --------------------
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken || (typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null);
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

      // If 401, could integrate with authApi refresh flow if needed
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        // Optionally, you can call authApi.refreshAccessTokenSilently() here
      }

      return Promise.reject(error);
    }
  );

  return api;
}
