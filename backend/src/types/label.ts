import { TaskLabel } from './task';

// -----------------------------
// Label entity
// -----------------------------
export interface Label {
  id: string;
  userId: string;
  name: string;
  color?: string;

  tasks?: TaskLabel[];

  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------
// DTOs / Input types
// -----------------------------
export interface LabelCreateInput {
  userId: string;
  name: string;
  color?: string;
}

export interface LabelUpdateInput {
  name?: string;
  color?: string;
}
