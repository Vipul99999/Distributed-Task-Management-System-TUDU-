"use client";

import React from "react";
import { Edit, Trash2, Star } from "lucide-react";
import { Task } from "@/types/task";

interface Props {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePinned?: () => void;
}

export const TaskActions: React.FC<Props> = ({ task, onEdit, onDelete, onTogglePinned }) => {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onEdit}
        aria-label="Edit task"
        title="Edit task"
        className="p-1 text-gray-600 hover:text-black"
      >
        <Edit size={16} />
      </button>

      <button
        onClick={onDelete}
        aria-label="Delete task"
        title="Delete task"
        className="p-1 text-gray-600 hover:text-red-600"
      >
        <Trash2 size={16} />
      </button>

      {onTogglePinned && (
        <button
          onClick={onTogglePinned}
          aria-label={task.pinned ? "Unpin task" : "Pin task"}
          title={task.pinned ? "Unpin task" : "Pin task"}
          className="p-1"
        >
          <Star size={16} className={task.pinned ? "text-yellow-500" : "text-gray-300"} />
        </button>
      )}
    </div>
  );
};
