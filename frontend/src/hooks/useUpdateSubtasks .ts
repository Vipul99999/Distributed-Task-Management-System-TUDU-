import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, SubTask } from "@/types/task";
import { updateSubtasks as apiUpdateSubtasks } from "@/lib/api/taskApi";
import { v4 as uuidv4 } from "uuid";

interface SubtaskPayload {
  id?: string;
  title: string;
  isCompleted?: boolean;
  orderIndex?: number;
  dueDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UpdateSubtasksVariables {
  taskId: string;
  payload: SubtaskPayload[];
}

interface OnMutateContext {
  previous?: Task[];
}

export const useUpdateSubtasks = () => {
  const queryClient = useQueryClient();

  return useMutation<SubTask[], unknown, UpdateSubtasksVariables, OnMutateContext>({
    mutationFn: ({ taskId, payload }) => apiUpdateSubtasks(taskId, payload),

    onMutate: async ({ taskId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((task) => {
          if (task.id !== taskId) return task;

          const existingSubtasks = task.subtasks || [];

          // Update existing subtasks
          const updatedSubtasks = existingSubtasks.map((s) => {
            const updated = payload.find((p) => p.id === s.id);
            if (!updated) return s;
            return {
              ...s,
              title: updated.title ?? s.title,
              isCompleted: updated.isCompleted ?? s.isCompleted,
              orderIndex: updated.orderIndex ?? s.orderIndex,
              dueDate: updated.dueDate ? updated.dueDate.toISOString() : s.dueDate,
              updatedAt: new Date(),
            };
          });

          // Add new subtasks (temp IDs or missing IDs)
          const newSubtasks = payload
            .filter((p) => !p.id || p.id.startsWith("temp-"))
            .map((p, i) => ({
              id: p.id ?? `temp-${uuidv4()}`,
              title: p.title,
              isCompleted: p.isCompleted ?? false,
              orderIndex: p.orderIndex ?? updatedSubtasks.length + i,
              dueDate: p.dueDate ? p.dueDate.toISOString() : undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

          return {
            ...task,
            subtasks: [...updatedSubtasks, ...newSubtasks],
          };
        })
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["tasks"], ctx.previous);
      }
    },

    // Fully replace subtasks with backend response
    onSuccess: (data, { taskId }) => {
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((task) => {
          if (task.id !== taskId) return task;

          const updatedSubtasks = data.map((s) => ({
            ...s,
            dueDate: s.dueDate ? new Date(s.dueDate).toISOString() : undefined,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          }));

          return { ...task, subtasks: updatedSubtasks };
        })
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
