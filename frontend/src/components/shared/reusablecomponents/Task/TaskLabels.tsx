"use client";

import React from "react";
import { Task, TaskLabel } from "@/types/task";

interface Props {
  task: Task;
  onAddLabel?: (taskId: string, label: TaskLabel) => void;
  onRemoveLabel?: (taskId: string, labelId: string) => void;
}

export const TaskLabels: React.FC<Props> = ({ task, onAddLabel, onRemoveLabel }) => {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {(task.labels || []).map((l) => (
        <span
          key={l.labelId}
          className="px-2 py-0.5 rounded-full text-xs flex items-center gap-2"
          style={{ backgroundColor: l.label?.color || "#eee" }}
        >
          <span>{l.label?.name}</span>
          {onRemoveLabel && (
            <button
              onClick={() => onRemoveLabel(task.id, l.labelId)}
              className="text-gray-500 ml-1 hover:text-red-500"
              title="Remove label"
            >
              ×
            </button>
          )}
        </span>
      ))}
      {onAddLabel && (
        <button
          onClick={() =>
            onAddLabel(task.id, {
              taskId: task.id,
              labelId: crypto.randomUUID(),
              label: {
                id: crypto.randomUUID(),
                name: "New",
                color: "#ccc",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            })
          }
          className="px-2 py-0.5 rounded-full text-xs border hover:bg-gray-100"
          title="Add new label"
        >
          + Label
        </button>
      )}
    </div>
  );
};
