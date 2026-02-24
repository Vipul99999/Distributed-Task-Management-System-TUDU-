"use client";

import React from "react";
import { Task } from "@/types/task";
import { Bell } from "lucide-react";
import { format, isBefore } from "date-fns";

interface Props {
  task: Task;
}

export const TaskMeta: React.FC<Props> = ({ task }) => {
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = due ? isBefore(due, new Date()) && !task.isCompleted : false;

  return (
    <div className="mt-2 text-xs text-gray-600 flex flex-wrap gap-2 items-center">
      {due && (
        <span className={`${isOverdue ? "text-red-500 font-semibold" : ""}`}>
          {format(due, "MMM dd, yyyy")} {format(due, "hh:mm a")}
        </span>
      )}

      {task.recurrence && task.recurrence !== "NONE" && (
        <span className="flex items-center gap-1 text-blue-600">
          <Bell size={14} /> {task.recurrence.toLowerCase()}
        </span>
      )}

      {(task.dependencies || []).length > 0 && (
        <span className="text-gray-500">
          Depends on: {(task.dependencies || [])
            .map((d) => d.dependsOn?.title ?? "Unknown")
            .slice(0, 3)
            .join(", ")}
          {(task.dependencies || []).length > 3
            ? ` +${(task.dependencies || []).length - 3}`
            : ""}
        </span>
      )}
    </div>
  );
};
