// backend/src/services/taskService.ts
import { prisma } from "../app";
import {
  TaskCreateInput,
  TaskUpdateInput,
  Task,
  LightweightSubtask,
  TaskLabel,
  TaskDependency,
} from "../types/task";
import { mapSubTasks, FrontendTask } from "../utils/mapTasks";
import { Prisma } from "@prisma/client";
import { mapTasksForFrontend, FrontendSubtask } from "../utils/mapTasks";

/**
 * createTask
 */
export const createTask = async (userId: string, data: TaskCreateInput) => {
  const mappedSubtasks = mapSubTasks(data.subtasks);

  const createdTask = await prisma.$transaction(async (tx) => {
    const taskOrder = await tx.taskOrder.upsert({
      where: { userId },
      update: { lastIndex: { increment: 1 } },
      create: { userId, lastIndex: 1 },
    });

    const taskOrderIndex = data.orderIndex ?? taskOrder.lastIndex;

    let subtasksCreateData;
    if (mappedSubtasks?.length) {
      let lastSubIndex = 0;
      subtasksCreateData = mappedSubtasks.map((subtask) => {
        const index = subtask.orderIndex ?? ++lastSubIndex;
        return { ...subtask, orderIndex: index };
      });
    }

    const task = await tx.task.create({
      data: {
        userId,
        title: data.title,
        pinned: data.pinned ?? false,
        isCompleted: data.isCompleted ?? false,
        ...(data.type ? { type: data.type } : {}),
        ...(data.priority ? { priority: data.priority } : {}),
        ...(data.recurrence ? { recurrence: data.recurrence } : {}),
        ...(data.recurrenceRule ? { recurrenceRule: data.recurrenceRule } : {}),
        ...(data.date ? { date: data.date } : {}),
        ...(data.dueDate ? { dueDate: data.dueDate } : {}),
        orderIndex: taskOrderIndex,
        ...(data.parentTaskId ? { parentTaskId: data.parentTaskId } : {}),
        ...(data.contextId ? { contextId: data.contextId } : {}),
        ...(data.lastSyncedAt ? { lastSyncedAt: data.lastSyncedAt } : {}),
        ...(subtasksCreateData
          ? { subtasks: { create: subtasksCreateData } }
          : {}),
      },
      include: { subtasks: true, labels: true, dependencies: true },
    });

    if (task.subtasks?.length) {
      const maxSubIndex = Math.max(
        ...task.subtasks.map((s) => s.orderIndex ?? 0)
      );
      await tx.taskSubtaskOrder.upsert({
        where: { taskId: task.id },
        update: { lastIndex: maxSubIndex },
        create: { taskId: task.id, lastIndex: maxSubIndex },
      });
    }

    return task;
  });

  return createdTask;
};

/**
 * updateTask
 */
export const updateTask = async (
  userId: string,
  taskId: string,
  data: TaskUpdateInput
) => {
  const mappedSubtasks = mapSubTasks(data.subtasks);

  let subtasksData:
    | Array<{
        title: string;
        isCompleted?: boolean;
        orderIndex?: number;
        dueDate?: Date | null;
      }>
    | undefined = undefined;

  if (mappedSubtasks?.length) {
    const subtaskOrder = await prisma.taskSubtaskOrder.upsert({
      where: { taskId },
      update: {},
      create: { taskId, lastIndex: 0 },
    });

    let lastIndex = subtaskOrder.lastIndex ?? 0;

    subtasksData = mappedSubtasks.map((s) => ({
      title: s.title,
      isCompleted: s.isCompleted ?? false,
      dueDate: s.dueDate ?? null,
      orderIndex: s.orderIndex ?? ++lastIndex,
    }));
  }

  const updatePayload: Prisma.TaskUpdateInput = {
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.type !== undefined ? { type: data.type } : {}),
    ...(data.priority !== undefined ? { priority: data.priority } : {}),
    ...(data.recurrence !== undefined ? { recurrence: data.recurrence } : {}),
    ...(data.recurrenceRule !== undefined
      ? { recurrenceRule: data.recurrenceRule }
      : {}),
    ...(data.date !== undefined ? { date: data.date } : {}),
    ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
    ...(data.pinned !== undefined ? { pinned: data.pinned } : {}),
    ...(data.isCompleted !== undefined
      ? { isCompleted: data.isCompleted }
      : {}),
    ...(data.orderIndex !== undefined ? { orderIndex: data.orderIndex } : {}),
    ...(data.parentTaskId !== undefined
      ? { parentTaskId: data.parentTaskId }
      : {}),
    ...(data.contextId !== undefined ? { contextId: data.contextId } : {}),
    ...(data.lastSyncedAt !== undefined
      ? { lastSyncedAt: data.lastSyncedAt }
      : {}),
    ...(subtasksData
      ? { subtasks: { deleteMany: {}, create: subtasksData } }
      : {}),
  };

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: updatePayload,
    include: {
      subtasks: true,
      labels: true,
      dependencies: true,
    },
  });

  if (subtasksData?.length) {
    const maxIndex = Math.max(...subtasksData.map((s) => s.orderIndex ?? 0));
    await prisma.taskSubtaskOrder.upsert({
      where: { taskId },
      update: { lastIndex: maxIndex },
      create: { taskId, lastIndex: maxIndex },
    });
  }

  return updated;
};

/**
 * getTasks
 */
interface GetTasksQuery {
  page?: string | number;
  limit?: string | number;
  sort?: "asc" | "desc";
}

export const getTasks = async (
  userId: string,
  query: GetTasksQuery = {}
): Promise<FrontendTask[]> => {
  let page = Number(query.page) || 1;
  let limit = Number(query.limit) || 50;
  if (page < 1) page = 1;
  if (limit < 1) limit = 50;

  const sortOrder = query.sort === "desc" ? "desc" : "asc";

  const tasksFromPrisma = await prisma.task.findMany({
    where: { userId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: [{ orderIndex: sortOrder }, { createdAt: "desc" }],
    include: {
      subtasks: { orderBy: { orderIndex: "asc" } },
      labels: { include: { label: true } },
      dependencies: { include: { dependsOn: true } },
    },
  });

  if (!tasksFromPrisma.length) return [];

  const normalizedTasks: Task[] = tasksFromPrisma.map((t: any) => ({
    ...t,
    orderIndex: t.orderIndex ?? undefined,
    recurrenceRule: t.recurrenceRule ?? undefined,
    date: t.date ?? undefined,
    dueDate: t.dueDate ?? undefined,
    parentTaskId: t.parentTaskId ?? undefined,
    contextId: t.contextId ?? undefined,
    lastSyncedAt: t.lastSyncedAt ?? undefined,
    subtasks: (t.subtasks ?? []).map((s: LightweightSubtask) => ({
      id: s.id,
      title: s.title,
      isCompleted: s.isCompleted,
      orderIndex: s.orderIndex ?? undefined,
      dueDate: s.dueDate ?? undefined,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
    labels: (t.labels ?? []).map((l: TaskLabel) => ({
      labelId: l.labelId,
      label: l.label
        ? {
            id: l.label.id,
            name: l.label.name,
            color: l.label.color ?? undefined,
          }
        : undefined,
    })),
    dependencies: (t.dependencies ?? [])
      .filter((d: TaskDependency) => !!d.dependsOn)
      .map((d: TaskDependency) => ({
        id: d.dependsOn.id,
        title: d.dependsOn.title,
        type: d.dependsOn.type,
        priority: d.dependsOn.priority,
        isCompleted: d.dependsOn.isCompleted,
        dueDate: d.dependsOn.dueDate ?? undefined,
        orderIndex: d.dependsOn.orderIndex ?? undefined,
      })),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  return mapTasksForFrontend(normalizedTasks);
};

/**
 * getTaskById
 */
export const getTaskById = async (
  userId: string,
  taskId: string
): Promise<FrontendTask> => {
  try {
    const taskFromPrisma = await prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        subtasks: { orderBy: { orderIndex: "asc" } },
        labels: { include: { label: true } },
        dependencies: true,
      },
    });

    if (!taskFromPrisma) {
      throw new Error("Task not found");
    }

    const mappedSubtasks: FrontendSubtask[] =
      (taskFromPrisma.subtasks ?? []).map((s) => ({
        id: s.id,
        title: s.title,
        isCompleted: s.isCompleted,
        orderIndex: s.orderIndex ?? undefined,
        dueDate: s.dueDate?.toISOString(),
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }));

    const mappedLabels = (taskFromPrisma.labels ?? []).map((l) => ({
      labelId: l.labelId,
      label: l.label
        ? {
            id: l.label.id,
            name: l.label.name,
            color: l.label.color ?? undefined,
          }
        : undefined,
    }));

    const mappedDependencies = (taskFromPrisma.dependencies ?? []).map((d) => ({
      id: d.dependsOnId,
      title: "",
      type: "",
      priority: "",
      isCompleted: false,
    }));

    return {
      id: taskFromPrisma.id,
      title: taskFromPrisma.title,
      type: taskFromPrisma.type,
      priority: taskFromPrisma.priority,
      recurrence: taskFromPrisma.recurrence,
      recurrenceRule: taskFromPrisma.recurrenceRule ?? undefined,
      date: taskFromPrisma.date?.toISOString(),
      dueDate: taskFromPrisma.dueDate?.toISOString(),
      pinned: taskFromPrisma.pinned,
      isCompleted: taskFromPrisma.isCompleted,
      orderIndex: taskFromPrisma.orderIndex ?? undefined,
      parentTaskId: taskFromPrisma.parentTaskId ?? undefined,
      contextId: taskFromPrisma.contextId ?? undefined,
      lastSyncedAt: taskFromPrisma.lastSyncedAt?.toISOString(),
      subtasks: mappedSubtasks,
      labels: mappedLabels,
      dependencies: mappedDependencies,
      createdAt: taskFromPrisma.createdAt.toISOString(),
      updatedAt: taskFromPrisma.updatedAt.toISOString(),
    };
  } catch {
    throw new Error("Failed to fetch task");
  }
};

/**
 * deleteTask
 */
export const deleteTask = async (userId: string, taskId: string) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new Error("Task not found or unauthorized");
    }

    const deletedTask = await prisma.task.delete({
      where: { id: taskId },
    });

    return { success: true, deletedTaskId: deletedTask.id };
  } catch {
    throw new Error("Failed to delete task");
  }
};

/**
 * batchSync
 */
export const batchSync = async (
  userId: string,
  tasks: (TaskCreateInput & { id?: string })[]
) => {
  const taskPromises = tasks.map(async (t) => {
    try {
      if (t.id) {
        return await updateTask(userId, t.id, t as TaskUpdateInput);
      } else {
        return await createTask(userId, t);
      }
    } catch (err: any) {
      return { error: err.message, task: t };
    }
  });

  const results = await Promise.allSettled(taskPromises);

  return results.map((r) =>
    r.status === "fulfilled" ? r.value : { error: r.reason }
  );
};

/**
 * reorderTasks
 */
export const reorderTasks = async (
  reordered: { id: string; orderIndex: number }[]
) => {
  if (!reordered.length) return;

  await prisma.$transaction(
    reordered.map((t) =>
      prisma.task.update({
        where: { id: t.id },
        data: { orderIndex: t.orderIndex },
      })
    )
  );
};