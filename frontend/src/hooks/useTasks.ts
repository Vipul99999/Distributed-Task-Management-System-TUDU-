"use client";

import { useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import {
  fetchTasks as fetchTasksApi,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  reorderTasks as apiReorderTasks,
} from "@/lib/api/taskApi";
import { Task, TaskLabel } from "@/types/task";
import { v4 as uuidv4 } from "uuid";

interface TaskContext {
  previousTasks?: Task[];
}

interface ReorderPayload {
  id: string;
  orderIndex: number;
}

interface OnMutateContext {
  previous?: Task[];
}



export const useTasks = () => {
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["tasks"];

  // -------------------- Fetch Tasks --------------------
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery<Task[], Error>({
    queryKey,
    queryFn: async () => {
      const tasksData = await fetchTasksApi();
      return tasksData ?? [];
    },
    staleTime: 60_000,
    retry: 2,
  });

  useEffect(() => {
    if (isError && error) {
      console.error("[useTasks] fetchTasks error:", error);
    }
  }, [isError, error]);

  // -------------------- Create Task --------------------
  const createTaskMutation = useMutation({
    mutationFn: async (task: Partial<Task>) => {
      try {

        const res = await apiCreateTask(task);
        return res;
      } catch (err: unknown) {
        // Normalize error for downstream handling & visibility
        console.error("[useTasks] apiCreateTask caught error:", err);
        const message =
          err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
        throw new Error(`createTask failed: ${message}`);
      }
    },
    onMutate: async (newTask: Partial<Task>) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey) ?? [];

      const tempTask: Task = {
        id: "temp-" + uuidv4(),
        title: newTask.title || "",
        type: (newTask.type as Task["type"]) || "PERSONAL",
        date: newTask.date,
        dueDate: newTask.dueDate,
        recurrence: (newTask.recurrence as Task["recurrence"]) || "NONE",
        priority: (newTask.priority as Task["priority"]) || "MEDIUM",
        pinned: newTask.pinned ?? false,
        isCompleted: newTask.isCompleted ?? false,
        orderIndex: typeof newTask.orderIndex === "number" ? newTask.orderIndex : undefined,
        parentTaskId: newTask.parentTaskId,
        subtasks: (newTask.subtasks ) || [],
        subTasksRelational: (newTask.subTasksRelational ) || [],
        contextId: newTask.contextId,
        lastSyncedAt: newTask.lastSyncedAt,
        dependencies: newTask.dependencies || [],
        dependents: newTask.dependents || [],
        labels: newTask.labels || [],
        // store timestamps as ISO strings in the cache for consistency with many backends
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as Task;

      queryClient.setQueryData<Task[]>(queryKey, (old = []) => [...old, tempTask]);
      return { previousTasks };
    },
    onError: (_err, _newTask, context?: TaskContext) => {
      console.error("[useTasks] createTask error:", _err);
      if (context?.previousTasks) queryClient.setQueryData(queryKey, context.previousTasks);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  // -------------------- Update Task --------------------
  const updateTaskMutation = useMutation({
    mutationFn: async (payload: { id: string; updates: Partial<Task> }) => {
      try {
        const res = await apiUpdateTask(payload.id, payload.updates);
        return res;
      } catch (err: unknown) {
        console.error("[useTasks] apiUpdateTask caught error:", err);
        const message =
          err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
        throw new Error(`updateTask failed: ${message}`);
      }
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey) ?? [];

      queryClient.setQueryData<Task[]>(queryKey, (old = []) =>
        old.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        )
      );
      return { previousTasks };
    },
    onError: (_err, _variables, context?: TaskContext) => {
      console.error("[useTasks] updateTask error:", _err);
      if (context?.previousTasks) queryClient.setQueryData(queryKey, context.previousTasks);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  // -------------------- Delete Task --------------------
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      try {
        const res = await apiDeleteTask(taskId);
      
        return res;
      } catch (err: unknown) {
        console.error("[useTasks] apiDeleteTask caught error:", err);
        const message =
          err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
        throw new Error(`deleteTask failed: ${message}`);
      }
    },
    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey) ?? [];
      queryClient.setQueryData<Task[]>(queryKey, (old = []) => old.filter((t) => t.id !== taskId));
      return { previousTasks };
    },
    onError: (_err, _taskId, context?: TaskContext) => {
      console.error("[useTasks] deleteTask error:", _err);
      if (context?.previousTasks) queryClient.setQueryData(queryKey, context.previousTasks);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const addLabel = (taskId: string, label: TaskLabel) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return console.warn(`[useTasks] addLabel: taskId ${taskId} not found`);

    const updatedLabels = [...(task.labels || []), { ...label, taskId }];
    updateTaskMutation.mutateAsync({
      id: taskId,
      updates: { labels: updatedLabels },
    });
  };

  const removeLabel = (taskId: string, labelId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return console.warn(`[useTasks] removeLabel: taskId ${taskId} not found`);

    const updatedLabels = (task.labels || []).filter((l) => l.labelId !== labelId);
    updateTaskMutation.mutateAsync({
      id: taskId,
      updates: { labels: updatedLabels },
    });
  };

  // --- Reorder Tasks ---
  const reorderTasks = useMutation<Task[], unknown, ReorderPayload[], OnMutateContext>({
    mutationFn: async (payload) => {
      try {
        const res = await apiReorderTasks(payload);
        return res;
      } catch (err: unknown) {
        console.error("[useTasks] apiReorderTasks caught error:", err);
        throw err;
      }
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old = []) => {
        const byId = new Map(newOrder.map((p) => [p.id, p.orderIndex]));
        return old
          .map((t) => (byId.has(t.id) ? { ...t, orderIndex: byId.get(t.id) } : t))
          .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      });

      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return {
    tasks,
    isLoading,
    isError,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    addLabel,
    removeLabel,
    reorderTasks,
  };
};

export const useTasksReorder = () => {
  const queryClient = useQueryClient();

  const reorderTasks = useMutation<Task[], unknown, ReorderPayload[], OnMutateContext>({
    mutationFn: (payload) => apiReorderTasks(payload),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old = []) => {
        const byId = new Map(newOrder.map((p) => [p.id, p.orderIndex]));
        return old
          .map((t) => (byId.has(t.id) ? { ...t, orderIndex: byId.get(t.id) } : t))
          .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      });

      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return { reorderTasks };
};