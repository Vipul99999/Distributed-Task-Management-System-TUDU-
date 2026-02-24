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
  userId: string;        // comes from JWT
  text: string;          // main improvement content
  futureNote?: string;   // optional reflection note
  categoryId?: string;   // optional link to a category
  date: string;          // ISO date string of the improvement day
  isCompleted: boolean;  // completed or not
  
}

// ----------------------
// Category type
// ----------------------
export interface Category {
  id: string;            // unique ID
  userId: string;        // comes from JWT
  name: string;          // category name
  icon?: string;         // optional emoji/icon
  color?: string;        // optional hex color

}

// ----------------------
// Streak type
// ----------------------
export interface Streak {
  id: string;            // unique ID
  userId: string;        // comes from JWT
  startDate: string;     // ISO date string
  endDate?: string;      // optional end date if streak ended
  length: number;        // consecutive days count
  isActive: boolean;     // whether streak is ongoing
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}
