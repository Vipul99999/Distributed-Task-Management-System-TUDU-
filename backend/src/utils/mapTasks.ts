import type {
  Task,
  LightweightSubtask,
  TaskLabel,
  TaskDependency,
  TaskSubtaskCreateInput,
} from "../types/task";

/* -----------------------------
   Types for Frontend
----------------------------- */

export interface FrontendSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
  orderIndex?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FrontendTask {
  id: string;
  title: string;
  type: string;
  priority: string;
  recurrence: string;
  recurrenceRule?: string;
  date?: string;
  dueDate?: string;
  pinned: boolean;
  isCompleted: boolean;
  orderIndex?: number;
  parentTaskId?: string;
  contextId?: string;
  lastSyncedAt?: string;
  subtasks: FrontendSubtask[];
  labels: {
    labelId: string;
    label?: { id: string; name: string; color?: string };
  }[];
  dependencies: {
    id: string;
    title: string;
    type: string;
    priority: string;
    isCompleted: boolean;
    dueDate?: string;
    orderIndex?: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

/* -----------------------------
   Map frontend subtasks to Prisma-compatible objects
   Returns undefined if no valid subtasks
----------------------------- */
export const mapSubTasks = (
  subtasks?: {
    id?: string;
    title: string;
    isCompleted?: boolean;
    orderIndex?: number | null;
    dueDate?: string | Date | null;
  }[]
): Omit<TaskSubtaskCreateInput, "taskId">[] | undefined => {
  if (!subtasks?.length) return undefined;

  const mapped = subtasks
    .filter((s) => s.title?.trim())
    .map((s) => ({
      ...(s.id && { id: s.id }),
      title: s.title.trim(),
      isCompleted: s.isCompleted ?? false,
      ...(s.orderIndex != null && { orderIndex: s.orderIndex }),
      ...(s.dueDate && {
        dueDate: s.dueDate instanceof Date ? s.dueDate : new Date(s.dueDate),
      }),
    }));

  return mapped.length ? mapped : undefined;
};

/* -----------------------------
   Map a single task for frontend
   Optimized for performance
----------------------------- */
const mapSubtask = (s: LightweightSubtask): FrontendSubtask => ({
  id: s.id,
  title: s.title,
  isCompleted: s.isCompleted,
  orderIndex: s.orderIndex ?? undefined,
  dueDate: s.dueDate?.toISOString(),
  createdAt: s.createdAt!.toISOString(),
  updatedAt: s.updatedAt!.toISOString(),
});

export const mapTasksForFrontend = (
  tasks: (Task & {
    subtasks?: LightweightSubtask[] | null;
    labels?: TaskLabel[] | null;
    dependencies?: TaskDependency[] | null;
  })[]
): FrontendTask[] =>
  tasks.map((task) => ({
    id: task.id,
    title: task.title,
    type: task.type,
    priority: task.priority,
    recurrence: task.recurrence,
    recurrenceRule: task.recurrenceRule ?? undefined,
    date: task.date?.toISOString(),
    dueDate: task.dueDate?.toISOString(),
    pinned: task.pinned,
    isCompleted: task.isCompleted,
    orderIndex: task.orderIndex ?? undefined,
    parentTaskId: task.parentTaskId ?? undefined,
    contextId: task.contextId ?? undefined,
    lastSyncedAt: task.lastSyncedAt?.toISOString(),

    subtasks: (task.subtasks ?? []).map(mapSubtask),

    labels: (task.labels ?? []).map((l) => ({
      labelId: l.labelId,
      label: l.label
        ? {
            id: l.label.id,
            name: l.label.name,
            color: l.label.color ?? undefined,
          }
        : undefined,
    })),

    dependencies: (task.dependencies ?? [])
      .filter((d): d is TaskDependency & { dependsOn: Task } => !!d.dependsOn)
      .map((d) => ({
        id: d.dependsOn.id,
        title: d.dependsOn.title,
        type: d.dependsOn.type,
        priority: d.dependsOn.priority,
        isCompleted: d.dependsOn.isCompleted,
        dueDate: d.dependsOn.dueDate?.toISOString(),
        orderIndex: d.dependsOn.orderIndex ?? undefined,
      })),

    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));

/* -----------------------------
   Map multiple tasks for frontend
----------------------------- */
