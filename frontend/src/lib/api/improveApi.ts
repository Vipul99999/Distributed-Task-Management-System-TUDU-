import { createApi } from "./apiClient";
import type { Improvement, Streak, Category } from "@/types/improve";
console.log("API base URL:", process.env.NEXT_PUBLIC_APP_API_URL);
console.log("API Service URL:", process.env.NEXT_PUBLIC_APP_SERVICE_URL);
const api = createApi(
  (process.env.NEXT_PUBLIC_APP_SERVICE_URL ) + "/api"
);

export const improveApi = {
  // Create a new improvement
  create: async (
    data: Omit<Improvement,"id" >
  ) => {
    const res = await api.post<Improvement>("/improve", data);
    return res.data;
  },

  // Get all improvements for the logged-in user
  getAll: async (): Promise<Improvement[]> => {
    const res = await api.get<Improvement[]>("/improve");
    return res.data;
  },

  // Get improvements for a specific date (for calendar)
  getByDate: async (date: string): Promise<Improvement[]> => {
    const res = await api.get<Improvement[]>(`/improve?date=${date}`);
    return res.data;
  },

  // Update an improvement by id
  update: async (
    id: string,
    data: Partial<Omit<Improvement, "id" >>
  ) => {
    const res = await api.put<Improvement>(`/improve/${id}`, data);
    return res.data;
  },

  // Delete an improvement (for undo, cleanup)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/improve/${id}`);
  },

  // Get all user categories (for dropdown/select)
  getCategories: async (): Promise<Category[]> => {
    const res = await api.get<Category[]>("/improve/category");
    return res.data;
  },

  // Create category
  createCategory: async (
    data: Omit<Category, "id" | "userId" | "improvements">
  ) => {
    const res = await api.post<Category>("/improve/category", data);
    return res.data;
  },

  // Get streaks for the logged-in user
  getStreaks: async (): Promise<Streak[]> => {
    const res = await api.get<Streak[]>("/improve/stats");
    return res.data;
  },
};
