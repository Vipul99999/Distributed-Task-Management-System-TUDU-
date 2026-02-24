import type { Label } from './label';

// -----------------------------
// Enums
// -----------------------------
export type TaskType = 'PERSONAL' | 'WORK' | 'HABIT' | 'TEMPLATE' | 'OTHER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RecurrenceRule = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

// -----------------------------
// Subtask
// -----------------------------
export interface LightweightSubtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  orderIndex?: number | null;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskSubtaskCreateInput {
  taskId: string;
  title: string;
  isCompleted?: boolean;
  orderIndex?: number | null;
  dueDate?: Date | null;
}

// -----------------------------
// TaskDependency
// -----------------------------
export interface TaskDependency {
  taskId: string;       // The task that has a dependency
  dependsOnId: string;  // The task it depends on
  dependsOn: Task;      // The dependent task object
}

// -----------------------------
// TaskLabel (Many-to-Many)
// -----------------------------
export interface TaskLabel {
  taskId: string;
  labelId: string;
  label?: Label;
}

// -----------------------------
// Task entity
// -----------------------------
export interface Task {
  id: string;
  userId: string;
  title: string;
  type: TaskType;
  priority: Priority;
  recurrence: RecurrenceRule;
  recurrenceRule?: string;
  date?: Date;
  dueDate?: Date;
  pinned: boolean;
  isCompleted: boolean;
  orderIndex?: number;

  parentTaskId?: string;
  subtasks?: LightweightSubtask[];
  contextId?: string;

  lastSyncedAt?: Date;

  labels?: TaskLabel[];
  dependencies?: TaskDependency[];

  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------
// Task Create / Update Inputs
// -----------------------------
export interface TaskCreateInput {
  title: string;
  userId: string;
  type?: TaskType;
  priority?: Priority;
  recurrence?: RecurrenceRule;
  recurrenceRule?: string ;
  date?: Date;
  dueDate?: Date;
  pinned?: boolean;
  isCompleted?: boolean;
  orderIndex?: number;

  parentTaskId?: string;
  subtasks?: Omit<TaskSubtaskCreateInput, 'taskId'>[];
  contextId?: string;

  labels?: Pick<TaskLabel, 'labelId'>[];
  lastSyncedAt?: Date;
}

export interface TaskUpdateInput extends Partial<TaskCreateInput> {}
