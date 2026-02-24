// (edited) Make createTask rethrow errors so callers can surface them.
import { createApi } from "./apiClient"; // Axios factory
import { Task } from "@/types/task";
console.log("in taskapi API base URL:", process.env.NEXT_PUBLIC_APP_API_URL);
console.log("in taskapi API Service URL:", process.env.NEXT_PUBLIC_APP_SERVICE_URL);
// -------------------- Create Axios instance --------------------
const taskApi = createApi(
  (process.env.NEXT_PUBLIC_APP_SERVICE_URL || "http://localhost:3002") + "/api"
);

// -------------------- Response Interfaces --------------------


interface DeleteTaskResponse {
  success: boolean;
}

// -------------------- CRUD Functions --------------------

// Fetch all tasks for current user
export const fetchTasks = async (): Promise<Task[]> => {
  try {
    console.log("Axios GET /tasks called");

    const res = await taskApi.get<{
      status: number;
      message: string;
      data: Task[];
    }>("/tasks");

    const tasks = res.data.data ?? []; // unwrap once
    if (!Array.isArray(tasks)) {
      console.warn(
        "fetchTasks: response data is not array, returning empty array"
      );
      return [];
    }

    return tasks;
  } catch (err) {
    console.error("fetchTasks error:", err);
    // rethrow so consumers can handle/log/display
    throw err;
  }
};

// Create a task
// Create a task (updated to accept multiple response shapes and rethrow)
export const createTask = async (task: Partial<Task>): Promise<Task> => {
  try {
    const res = await taskApi.post("/tasks", task);

    // Debug: log the whole response so you can see the actual shape in DevTools console
    console.debug("createTask response (raw):", {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
      data: res.data,
    });

    // Accept several common response shapes from the server:
    // - { task: Task }
    // - { data: Task } (your fetchTasks uses res.data.data)
    // - { data: { task: Task } }
    // - direct task as res.data
    const body = res.data ;
    const candidate =
      (body && (body.task ?? body.data ?? (body.data && body.data.task) ?? body)) ||
      null;

    if (!candidate) {
      // include the whole response for better debugging in the thrown error
      const debug = {
        status: res.status,
        statusText: res.statusText,
        data: res.data,
      };
      console.error("createTask: server response missing created task", debug);
      throw new Error(
        `createTask: server did not return created task; response=${JSON.stringify(
          debug
        )}`
      );
    }

    // Return the unwrapped task object
    return candidate as Task;
  } catch (err) {
    console.error("createTask error:", err);
    // Rethrow the error so upstream (useTasks / TaskModal) can surface it
    throw err;
  }
};

export const updateTask = async (
  id: string,
  payload: Partial<Task>
): Promise<Task> => {
  try {
    const res = await taskApi.put(`/tasks/${id}`, payload);
  
    const body = res.data ;
    const candidate =
      (body && (body.task ?? body.data ?? (body.data && body.data.task) ?? body)) ||
      null;
    if (!candidate) {
      throw new Error(`updateTask: server did not return updated task; response=${JSON.stringify(res.data)}`);
    }
    return candidate as Task;
  } catch (err) {
    console.error("updateTask error:", err);
    throw err;
  }
};

// Delete a task
export const deleteTask = async (id: string): Promise<boolean> => {
  const res = await taskApi.delete<DeleteTaskResponse>(`/tasks/${id}`);
  return res.data.success;
};

export const reorderTasks = async (
  payload: { id: string; orderIndex: number }[]
) => {
  // POST /api/tasks/reorder { reordered: [...] }
  const res = await taskApi.post("/tasks/reorder", { reordered: payload });
  return res.data;
};

export const updateSubtasks = async (
  taskId: string,
  subtasks: {
    id?: string;
    title: string;
    isCompleted?: boolean;
    orderIndex?: number;
    dueDate?: Date | null;
  }[]
) => {
  // POST /api/tasks/:taskId/subtasks
  console.log("subtasks are going to update...")
  const res = await taskApi.post(`/tasks/${taskId}/subtasks`, {
    subtasks
  });
  return res.data;
};

// -------------------- Export Axios Instance (Optional) --------------------
export { taskApi };