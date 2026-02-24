"use client";

import React from "react";
import { Task } from "@/types/task";

interface CompactTaskCardProps {
  task: Task;
  onClick: () => void;
  className?: string;
}

const priorityColors: Record<string, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-400",
  HIGH: "bg-red-500",
  URGENT: "bg-purple-600",
};

export const CompactTaskCard: React.FC<CompactTaskCardProps> = ({ task, onClick, className = "" }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className={`cursor-pointer select-none rounded border border-gray-200 p-2 flex items-center justify-between gap-2 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-150 ${className}`}
      aria-label={`Task: ${task.title}, Due date: ${
        task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"
      }, Priority: ${task.priority}`}
      title={task.title}
    >
      {/* Title truncated */}
      <span className="truncate flex-1 text-sm font-medium text-gray-900">{task.title}</span>

      {/* Due date */}
      {task.dueDate && (
        <time
          dateTime={new Date(task.dueDate).toISOString()}
          className="ml-2 text-xs text-gray-500 whitespace-nowrap"
          aria-label={`Due date ${new Date(task.dueDate).toLocaleDateString()}`}
        >
          {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </time>
      )}

      {/* Priority color badge */}
      <span
        className={`ml-2 w-3 h-3 rounded-full flex-shrink-0 ${priorityColors[task.priority || "LOW"] || "bg-gray-300"}`}
        aria-label={`Priority ${task.priority}`}
        title={`Priority: ${task.priority}`}
      />
    </div>
  );
};
