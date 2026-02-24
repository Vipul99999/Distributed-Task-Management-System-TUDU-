// types/improve.ts

// ----------------------
// Enums
// ----------------------
export enum ImprovementStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
}

// ----------------------
// Improvement type
// ----------------------
export interface Improvement {
  id: string;            // unique ID (cuid)
  text: string;          // main improvement content
  date:string;          // date created
  futureNote?: string;   // optional reflection note
  categoryId?: string;   // optional link to a category
  isCompleted: boolean;  // completed or not
    
}

export interface CreateImprovement{
    text: string;          // main improvement content
  futureNote?: string;   // optional reflection note
  categoryId?: string;
}
// ----------------------
// Category type
// ----------------------
export interface Category {
  id: string;            // unique ID
  name: string;          // category name
  icon?: string;         // optional emoji/icon
  color?: string;        // optional hex color
}

// ----------------------
// Streak type
// ----------------------
export interface Streak {
  id: string;            // unique ID
  startDate: string;     // ISO date string
  endDate?: string;      // optional end date if streak ended
  length: number;        // consecutive days count
  isActive: boolean;     // whether streak is ongoing
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}
