"use client";

import { create } from "zustand";
import { MobileSection } from "@/types/navigation"; // import MobileSection

export const TASK_TABS = ["today", "upcoming", "completed", "overdue", "profile","improvements"] as const;
export type TaskTab = typeof TASK_TABS[number];

type DashboardState = {
  section: MobileSection; // use MobileSection here
  taskTab: TaskTab;
  setSection: (s: MobileSection) => void;
  setTaskTab: (t: TaskTab) => void;
  resetDashboard: () => void;
  isTasksSection: () => boolean;
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  section: "home",
  taskTab: "today",

  setSection: (s) => set({ section: s }),
  setTaskTab: (t) => set({ taskTab: t }),

  resetDashboard: () => set({ section: "home", taskTab: "today" }),

  isTasksSection: () => get().section === "tasks",
}));
