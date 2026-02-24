import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderTasks as apiReorderTasks, updateSubtasks as apiUpdateSubtasks } from "@/lib/api/taskApi";
import type { Task, SubTask } from "@/types/task";

interface ReorderPayload {
  id: string;
  orderIndex: number;
}

interface SubtaskPayload {
  id?: string;
  title: string;
  isCompleted?: boolean;
  orderIndex?: number;
  dueDate?: Date | null;
}

interface UpdateSubtasksVariables {
  taskId: string;
  payload: SubtaskPayload[];
}

interface OnMutateContext {
  previous?: Task[];
}

export const useTasksReorder = () => {
  const queryClient = useQueryClient();

  // --- Reorder Tasks ---
  const reorderTasks = useMutation<
    Task[],
    unknown,
    ReorderPayload[],
    OnMutateContext
  >({
    mutationFn: (payload) => apiReorderTasks(payload),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old = []) => {
        const byId = new Map(newOrder.map((p) => [p.id, p.orderIndex]));
        return old
          .map((t) =>
            byId.has(t.id) ? { ...t, orderIndex: byId.get(t.id) } : t
          )
          .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      });

      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // --- Update Subtasks ---
  const updateSubtasks = useMutation<
    SubTask[],
    unknown,
    UpdateSubtasksVariables,
    OnMutateContext
  >({
    mutationFn: ({ taskId, payload }) => apiUpdateSubtasks(taskId, payload),

    // Optimistic update
    onMutate: async ({ taskId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: payload.map((p) => {
                  // Try to find existing subtask in cache
                  const existing = p.id
                    ? task.subtasks?.find((s) => s.id === p.id)
                    : undefined;

                  // If found, keep it, else create a temp subtask for optimistic update
                  return (
                    existing ?? {
                      id: p.id ?? `temp-${Math.random()}`,
                      title: p.title,
                      isCompleted: p.isCompleted ?? false,
                      orderIndex: p.orderIndex ?? 0,
                      dueDate: p.dueDate ? p.dueDate.toISOString() : undefined,
                      createdAt: new Date(), // placeholder
                      updatedAt: new Date(), // placeholder
                    }
                  );
                }),
              }
            : task
        )
      );

      return { previous };
    },

    // Rollback on error
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },

    // Refresh data after mutation settles
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return { reorderTasks, updateSubtasks };
};
