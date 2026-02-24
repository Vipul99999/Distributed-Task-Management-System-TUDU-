// src/utils/validators.ts
import { z } from 'zod';
import type { TaskType, Priority, RecurrenceRule, LightweightSubtask } from '../types/task';

// -----------------------------
// Subtasks
// Create schema (no id, createdAt, updatedAt)
export const TaskSubtaskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  isCompleted: z.boolean().default(false),
  orderIndex: z.number().optional(),
  dueDate: z.coerce.date().optional(),
});

// Update schema (requires id)
export const TaskSubtaskUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  isCompleted: z.boolean().optional(),
  orderIndex: z.number().optional(),
  dueDate: z.coerce.date().optional(),
});

// Optional full entity schema
export const TaskSubtaskSchema: z.ZodType<LightweightSubtask> = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  title: z.string().min(1),
  isCompleted: z.boolean(),
  orderIndex: z.number().optional(),
  dueDate: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});


// -----------------------------
// Tasks
export const TaskCreateSchema = z.object({
  title: z.string().min(1),

  type: z.enum(['PERSONAL','WORK','HABIT','TEMPLATE','OTHER']) as z.ZodType<TaskType>,
  priority: z.enum(['LOW','MEDIUM','HIGH','URGENT']) as z.ZodType<Priority>,
  recurrence: z.enum(['NONE','DAILY','WEEKLY','MONTHLY','CUSTOM']) as z.ZodType<RecurrenceRule>,
  recurrenceRule: z.string().optional(),
  date: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  pinned: z.boolean().default(false).optional(),
  isCompleted: z.boolean().default(false).optional(),
  orderIndex: z.number().optional(),

  subtasks: z.array(TaskSubtaskCreateSchema).optional(),
  labels: z.array(z.object({ labelId: z.string().uuid() })).optional(),
  parentTaskId: z.string().uuid().optional(),
  contextId: z.string().optional(),
  lastSyncedAt: z.coerce.date().optional(),
});

// recurrenceRule required for CUSTOM
export const TaskCreateValidatedSchema = TaskCreateSchema.refine(
  (data) => data.recurrence !== 'CUSTOM' || !!data.recurrenceRule,
  {
    message: 'recurrenceRule is required when recurrence is CUSTOM',
    path: ['recurrenceRule'],
  }
);

export const TaskUpdateSchema = TaskCreateSchema.partial();

// -----------------------------
// Labels
export const LabelCreateSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1),
  color: z.string().optional(),
});
export const LabelUpdateSchema = LabelCreateSchema.partial();

// -----------------------------
// Task Dependency
export const TaskDependencyCreateSchema = z.object({
  taskId: z.string().uuid(),
  dependsOnId: z.string().uuid(),
}).refine(data => data.taskId !== data.dependsOnId, {
  message: 'A task cannot depend on itself',
});
export const TaskDependencyUpdateSchema = TaskDependencyCreateSchema.partial();

// -----------------------------
// TaskLabel (Many-to-Many)
export const TaskLabelCreateSchema = z.object({
  taskId: z.string().uuid(),
  labelId: z.string().uuid(),
});
export const TaskLabelUpdateSchema = TaskLabelCreateSchema.partial();

// -----------------------------
// Query / Get Schemas
export const TaskQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});

export const TaskGetSchema = z.object({
  userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),
});
