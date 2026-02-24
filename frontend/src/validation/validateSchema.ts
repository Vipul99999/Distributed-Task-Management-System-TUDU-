import { z } from "zod";

/* ===========================
   SubTask / TaskSubtask Schema
=========================== */
export interface SubTask {
  id: string;             // required for TaskSubtask table
  title: string;          // subtask text/title
  isCompleted: boolean;
  orderIndex?: number;
  dueDate?: string;
}

const SubTaskSchema: z.ZodType<SubTask> = z.object({
  id: z.string(),
  title: z.string().min(1, "Subtask title is required"),
  isCompleted: z.boolean().default(false),
  orderIndex: z.number().optional(),
  dueDate: z.string().optional(),
});

/* ===========================
   Task Form Schema
=========================== */
export const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),

  // New subtasks table
  subtasks: z.array(SubTaskSchema).optional(),


  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]),
  type: z.enum(["PERSONAL", "WORK", "OTHER"]),

  dueDate: z.string().optional(),
  dueTime: z.string().optional(),

  reminderEnabled: z.boolean().optional(),
  reminderTime: z.string().optional(),
  pinned: z.boolean().optional(),
  customRecurrence: z.number().optional(),

 
}).superRefine((data, ctx) => {
  if (data.reminderEnabled && !data.reminderTime) {
    ctx.addIssue({
      path: ["reminderTime"],
      message: "Reminder time required if reminder is enabled",
      code: "custom",
    });
  }
});

/* ===========================
   TypeScript Inference
=========================== */
export type TaskFormData = z.infer<typeof TaskSchema>;
export type SubTaskFormData = SubTask;

// -----------------------------
// Other Schemas
// -----------------------------
export const ImprovementSchema = z.object({
  text: z.string().min(1),
  futureNote: z.string().optional(),
  categoryId: z.string().optional(),
  isCompleted: z.boolean().default(true),
  date: z.string().optional(),
});

export const CategorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
});

export const StreakSchema = z.object({
  userId: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  length: z.number().int().min(1),
  isActive: z.boolean().default(true),
});

export const LabelSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  color: z.string().optional(),
});

export const TaskDependencySchema = z.object({
  taskId: z.string(),
  dependsOnId: z.string(),
});
