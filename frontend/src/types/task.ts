export type StatusFilter = "all" | "completed" | "pending";
export type PriorityFilter = "all" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type PinnedFilter = "all" | "pinned" | "unpinned";
export type TypeFilter = "all" | 'PERSONAL' | 'WORK' | 'HABIT' | 'TEMPLATE' | 'OTHER';

export type TaskType = 'PERSONAL' | 'WORK' | 'HABIT' | 'TEMPLATE' | 'OTHER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RecurrenceRule = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

// -----------------------------
// Task dependencies and labels
// -----------------------------
export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnId: string;
  dependsOn?: {
    id: string;
    title: string;
    type: string;
    priority: string;
    isCompleted: boolean;
    dueDate?: string;
    orderIndex?: number;
  };
}


export interface Label {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskLabel {
  taskId: string;
  labelId: string;
  label: Label;
}

// -----------------------------
// Subtask / Checklist
// -----------------------------
export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  orderIndex?: number;
  dueDate?: string | null; // <-- string, not Date
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskSubtaskCreateInput {
  title: string;
  isCompleted?: boolean;
  orderIndex?: number | null;
  dueDate?: Date | null;
}
// -----------------------------
// Main Task Interface
// -----------------------------
export interface Task {
  id: string;
  title: string;
  date?: string;
  type: TaskType;
  recurrence:RecurrenceRule;
  priority:Priority;
  pinned: boolean;
  isCompleted: boolean;
  orderIndex?: number;
  dueDate?: string;

  parentTaskId?: string;

  // Children Task entities
  subTasksRelational?: Task[];

  // Lightweight relational subtasks stored in TaskSubtask table
  subtasks?: SubTask[];

  contextId?: string;
  goalId?: string;

  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;

  dependencies?: TaskDependency[];
  dependents?: TaskDependency[];
  labels?: TaskLabel[];
}


// -----------------------------
// Task Form Data (frontend form)
// -----------------------------
export interface TaskFormData {
  title: string;
  subtasks?: SubTask[];      // corresponds to TaskSubtask table
  priority: Priority;
  recurrence: RecurrenceRule;
  type: TaskType;
  dueDate?: string;
  dueTime?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  pinned?: boolean;
  customRecurrence?: number;
}


// frontend/src/components/shared/taskModels/Desciption/types.ts

export interface DescriptionItem {
  id: string;
  text: string;
  completed: boolean;
  children?: DescriptionItem[];
  isTask?: boolean;
}
export interface TaskCreateInput {
  title: string;
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
