import type { Task, LightweightSubtask, TaskLabel, TaskDependency,  } from './task';

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
  labels: { labelId: string; label?: { id: string; name: string; color?: string } }[];
  dependencies: {
    id: string;
    title: string;
    isCompleted: boolean;
    type: string;
    priority: string;
  }[]; // Minimal info for performance
 
  createdAt: string;
  updatedAt: string;
};

export const mapTaskForFrontend = (
  task: Task & {
    subtasks?: LightweightSubtask[] | null;
    labels?: TaskLabel[] | null;
    dependencies?: TaskDependency[] | null;
  }
): FrontendTask => {
  return {
    id: task.id,
    title: task.title,
    type: task.type,
    priority: task.priority,
    recurrence: task.recurrence,
    recurrenceRule: task.recurrenceRule,
    date: task.date?.toISOString(),
    dueDate: task.dueDate?.toISOString(),
    pinned: task.pinned,
    isCompleted: task.isCompleted,
    orderIndex: task.orderIndex,
    parentTaskId: task.parentTaskId,
    contextId: task.contextId,
    lastSyncedAt: task.lastSyncedAt?.toISOString(),

    // Map subtasks fully
    subtasks: (task.subtasks ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      isCompleted: s.isCompleted,
      orderIndex: s.orderIndex ?? undefined,
      dueDate: s.dueDate?.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),

    // Map labels fully
    labels: (task.labels ?? []).map((l) => ({
      labelId: l.labelId,
      label: l.label
        ? { id: l.label.id, name: l.label.name, color: l.label.color ?? undefined }
        : undefined,
    })),

    // Dependencies: only minimal fields to reduce processing time
    dependencies: (task.dependencies ?? []).map((d) => ({
      id: d.dependsOn.id,
      title: d.dependsOn.title,
      isCompleted: d.dependsOn.isCompleted,
      type: d.dependsOn.type,
      priority: d.dependsOn.priority,
    })),

    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
};
