import { prisma } from "../app";

/**
 * Reorder subtasks for a given task
 */
export const syncSubtasks = async (
  userId: string,
  taskId: string,
  subtasks: {
    id?: string;
    title: string;
    isCompleted?: boolean;
    orderIndex?: number;
    dueDate?: Date | null;
  }[]
) => {
  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Verify task ownership
    const task = await tx.task.findFirst({
      where: { id: taskId, userId },
      include: { subtasks: true },
    });

    if (!task) {
      throw new Error("Task not found or unauthorized");
    }

    const existingIds = task.subtasks.map((s) => s.id);
    const incomingIds = subtasks.filter((s) => s.id).map((s) => s.id!);

    // 2️⃣ Delete removed subtasks
    const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));

    if (idsToDelete.length > 0) {
      await tx.taskSubtask.deleteMany({ where: { id: { in: idsToDelete } } });
    }

    // 3️⃣ Update existing subtasks
    const updateTargets = subtasks.filter(
      (s) => s.id && existingIds.includes(s.id)
    );

    const updatePromises = updateTargets.map((s) =>
      tx.taskSubtask.update({
        where: { id: s.id! },
        data: {
          title: s.title,
          isCompleted: s.isCompleted ?? false,
          orderIndex: s.orderIndex,
          dueDate: s.dueDate ?? null,
        },
      })
    );

    const updatedSubtasks = await Promise.all(updatePromises);

    // 4️⃣ Insert new subtasks (IDs starting with "temp-")
    const newSubtasks = subtasks.filter((s) =>
      s.id?.startsWith("temp-")
    );

    let createdSubtasks: any[] = [];

    if (newSubtasks.length > 0) {
      await tx.taskSubtask.createMany({
        data: newSubtasks.map((s) => ({
          taskId,
          title: s.title,
          isCompleted: s.isCompleted ?? false,
          orderIndex: s.orderIndex,
          dueDate: s.dueDate ?? null,
        })),
      });

      createdSubtasks = await tx.taskSubtask.findMany({
        where: {
          taskId,
          title: { in: newSubtasks.map((s) => s.title) },
        },
      });
    }

    const allSubtasks = [...updatedSubtasks, ...createdSubtasks];

    return allSubtasks.sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
    );
  });
};

export const syncSubtasksOptimized = async (
  userId: string,
  taskId: string,
  subtasks: {
    id?: string;
    title: string;
    isCompleted?: boolean;
    orderIndex?: number;
    dueDate?: Date | null;
  }[]
) => {
  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Verify task ownership
    const task = await tx.task.findFirst({
      where: { id: taskId, userId },
      select: { id: true },
    });

    if (!task) throw new Error("Task not found or unauthorized");

    // 2️⃣ Delete removed subtasks
    const existingIds = (
      await tx.taskSubtask.findMany({
        where: { taskId },
        select: { id: true },
      })
    ).map((s) => s.id);

    const incomingIds = subtasks.filter((s) => s.id).map((s) => s.id!);
    const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));

    if (idsToDelete.length > 0) {
      await tx.taskSubtask.deleteMany({ where: { id: { in: idsToDelete } } });
    }

    // 3️⃣ Bulk update
    const existingSubtasksToUpdate = subtasks.filter(
      (s) => s.id && existingIds.includes(s.id)
    );

    if (existingSubtasksToUpdate.length > 0) {
      const updates = existingSubtasksToUpdate.map(
        (s) =>
          `('${s.id}', '${s.title.replace(/'/g, "''")}', ${
            s.isCompleted ?? false
          }, ${s.orderIndex ?? "NULL"}, ${
            s.dueDate ? `'${s.dueDate.toISOString()}'` : "NULL"
          })`
      );

      const updateQuery = `
        CREATE TEMP TABLE tmp_subtasks (
          id uuid,
          title text,
          "isCompleted" boolean,
          "orderIndex" float,
          "dueDate" timestamp
        ) ON COMMIT DROP;

        INSERT INTO tmp_subtasks (id, title, "isCompleted", "orderIndex", "dueDate")
        VALUES ${updates.join(",")};

        UPDATE "TaskSubtask" t
        SET
          title = tmp.title,
          "isCompleted" = tmp."isCompleted",
          "orderIndex" = tmp."orderIndex",
          "dueDate" = tmp."dueDate",
          "updatedAt" = NOW()
        FROM tmp_subtasks tmp
        WHERE t.id = tmp.id;
      `;

      await tx.$executeRawUnsafe(updateQuery);
    }

    // 4️⃣ Bulk insert
    const newSubtasks = subtasks.filter((s) => !s.id);

    if (newSubtasks.length > 0) {
      await tx.taskSubtask.createMany({
        data: newSubtasks.map((s) => ({
          taskId,
          title: s.title,
          isCompleted: s.isCompleted ?? false,
          orderIndex: s.orderIndex,
          dueDate: s.dueDate ?? null,
        })),
      });
    }

    // 5️⃣ Return sorted subtasks
    return await tx.taskSubtask.findMany({
      where: { taskId },
      orderBy: { orderIndex: "asc" },
    });
  });
};

/**
 * Get subtasks
 */
export const getSubtasks = async (userId: string, taskId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { userId: true },
  });

  if (!task || task.userId !== userId) {
    return [];
  }

  return await prisma.taskSubtask.findMany({
    where: { taskId },
    orderBy: { orderIndex: "asc" },
  });
};

export const getDependencies = async (userId: string, taskId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { userId: true },
  });

  if (!task || task.userId !== userId) {
    return [];
  }

  return await prisma.taskDependency.findMany({
    where: { taskId },
    include: { dependsOn: true },
  });
};