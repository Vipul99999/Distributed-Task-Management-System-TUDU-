"use client";

import React, { useMemo } from "react";
import { TaskList } from "@/components/shared/reusablecomponents/Task/TaskList";
import { CalendarView } from "@/components/shared/reusablecomponents/ViewSelector/CalendarView/CalendarView";
import { TableView as TableView2 } from "@/components/shared/reusablecomponents/ViewSelector/TableView/TableView";

export type FilterType = "today" | "upcoming" | "completed" | "overdue";
type ViewType = "List" | "Table" | "Calendar";

interface Props {
  filter: FilterType;
  view?: ViewType;
}

export default function TasksPage({ filter, view = "List" }: Props) {
  // Helper: normalize to local midnight
  const getStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getEndOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const today = useMemo(() => getStartOfDay(new Date()), []);
  const todayEnd = useMemo(() => getEndOfDay(new Date()), []);

  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return getStartOfDay(d);
  }, [today]);

  const yesterday = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return getEndOfDay(d);
  }, [today]);

  // 🔧 Build the filter object
  const taskFilter = useMemo(() => {
    switch (filter) {
      case "today":
        return {
          dateFrom: today.toISOString(),
          dateTo: todayEnd.toISOString(),
          completed: "all",
        };
      case "upcoming":
        return {
          dateFrom: tomorrow.toISOString(),
          completed: "all",
        };
      case "overdue":
        return {
          dateTo: yesterday.toISOString(),
          completed: "all",
        };
      case "completed":
        return { completed: "completed" };
      default:
        return { completed: "all" };
    }
  }, [filter, today, todayEnd, tomorrow, yesterday]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4 capitalize">{filter} Tasks</h2>

      {view === "List" && <TaskList filter={taskFilter} availableLabels={[]} />}
      {view === "Table" && (
        <TableView2 filter={taskFilter} availableLabels={[]} />
      )}
      {view === "Calendar" && (
        <CalendarView filter={taskFilter} availableLabels={[]} />
      )}
    </div>
  );
}
