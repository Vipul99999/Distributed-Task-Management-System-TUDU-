// frontend/src/lib/api/labelApi.ts
import { createApi } from "./apiClient";
import { Label } from "@/types/task";
console.log("labelApi base URL:", process.env.NEXT_PUBLIC_APP_SERVICE_URL );
const labelApi = createApi(
  (process.env.NEXT_PUBLIC_APP_SERVICE_URL ) + "/api"
);

export interface CreateLabelDto {
  name: string;
  color?: string;
}

export interface UpdateLabelDto {
  name?: string;
  color?: string;
}

// -------------------- CRUD --------------------

// Get all labels for current user
export const getLabels = async (): Promise<Label[]> => {
  const res = await labelApi.get<Label[]>("/");
  return res.data;
};


// Create a new label
export const createLabel = async (data: CreateLabelDto): Promise<Label> => {
  const res = await labelApi.post<Label>("/", data);
  return res.data;
};

// Update a label
export const updateLabel = async (id: string, data: UpdateLabelDto): Promise<Label> => {
  const res = await labelApi.put<Label>(`/${id}`, data);
  return res.data;
};

// Delete a label
export const deleteLabel = async (id: string): Promise<void> => {
  await labelApi.delete(`/${id}`);
};


export {labelApi};
