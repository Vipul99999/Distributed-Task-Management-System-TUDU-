"use client";
import { useEffect } from "react";

import React, { useState } from "react";
import { Task, TaskLabel } from "@/types/task";
import { TaskActions } from "./TaskActions";
import { TaskSubtasks } from "./TaskSubtasks";
import { TaskLabels } from "./TaskLabels";
import { TaskMeta } from "./TaskMeta";
import { useTasks } from "@/hooks/useTasks";

interface Props {
  task: Task;
  onToggleComplete?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onTogglePinned?: () => void;
  onChangePriority?: (priority: Task["priority"]) => void;
}

const priorityColors: Record<string, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-400",
  HIGH: "bg-red-500",
  URGENT: "bg-purple-600",
};

export const TaskCard: React.FC<Props> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onTogglePinned,
  onChangePriority,
}) => {
  const [open, setOpen] = useState(false);
  const { updateTask } = useTasks();

  
  
// inside your TaskCard component
useEffect(() => {
  console.log("Task details (after subtasks loaded)", task);
  console.log("subTask titles", task.subtasks?.map(s => s.title));
}, [task.subtasks]);

 
  // --- Label handlers ---
  const handleAddLabel = (taskId: string, label: TaskLabel) => {
    updateTask({
      id: taskId,
      updates: { labels: [...(task.labels || []), label] },
    });
  };
  const handleRemoveLabel = (taskId: string, labelId: string) => {
    const updatedLabels =
      task.labels?.filter((l) => l.labelId !== labelId) || [];
    updateTask({ id: taskId, updates: { labels: updatedLabels } });
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition">
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={onToggleComplete}
          className="w-5 h-5 mt-1"
        />

        <div className="flex-1">
          <div className="flex justify-between items-center gap-2">
            <h3
              className={`text-sm font-semibold ${
                task.isCompleted ? "line-through text-gray-400" : ""
              }`}
            >
              {task.title}
            </h3>

            <TaskActions
              task={task}
              onEdit={onEdit ?? (() => {})}
              onDelete={onDelete ?? (() => {})}
              onTogglePinned={onTogglePinned ?? (() => {})}
            />
          </div>

         
          {/* Priority */}
          <select
            className={`mt-1 text-xs border rounded px-2 py-0.5 ${
              priorityColors[task.priority || "LOW"]
            }`}
            value={task.priority}
            onChange={(e) =>
              onChangePriority?.(e.target.value as Task["priority"])
            }
          >
            {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Modal-based Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
                    <TaskSubtasks
  task={task}
  open={open}
  setOpen={setOpen}
/>
          )}
  


          {/* Meta & Labels */}
          <TaskMeta task={task} />
          <TaskLabels
            task={task}
            onAddLabel={handleAddLabel}
            onRemoveLabel={handleRemoveLabel}
          />
        </div>
      </div>
    </div>
  );
};
