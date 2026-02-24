"use client";

import React, { useState, useCallback } from "react";
import { Task } from "@/types/task";
import { SortableTaskList } from "../../DnD/SortableTaskList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskCard } from "../../Task/TaskCard";

interface CalendarDayProps {
  day: Date;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onReorder: (tasks: Task[]) => void;
  onMove: (task: Task, targetListId: string) => void;
  className?: string;
}

const priorityColors: Record<string, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-400",
  HIGH: "bg-red-500",
  URGENT: "bg-purple-600",
};

export const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  tasks,
  onTaskClick,
  onReorder,
  onMove,
  className = "",
}) => {
  const [showAll, setShowAll] = useState(false);

  const today = new Date();
  const isToday = today.toDateString() === day.toDateString();

  const tasksForDay = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === day.toDateString();
  });

  const visibleTasks = tasksForDay.slice(0, 3);
  const extraCount = tasksForDay.length - visibleTasks.length;

  const handleTaskClick = useCallback(
    (task: Task) => {
      onTaskClick(task);
    },
    [onTaskClick]
  );

  const renderCompactTaskCard = (task: Task) => (
    <div
      key={task.id}
      onClick={(e) => {
        e.stopPropagation();
        handleTaskClick(task);
      }}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium 
                 cursor-pointer transition-all hover:bg-gray-100"
    >
      {/* Priority dot */}
      <span
        className={`w-2 h-2 rounded-full ${
          priorityColors[task.priority || "LOW"] || "bg-gray-400"
        }`}
      />

      {/* Task title */}
      <span className="truncate flex-1 text-gray-800">
        {task.title}
      </span>
    </div>
  );

  return (
    <div
      className={`group border border-gray-200 
                  min-h-[120px] p-2 flex flex-col 
                  transition-all duration-200
                  hover:bg-gray-50
                  ${isToday ? "bg-blue-50 border-blue-400" : "bg-white"}
                  ${className}`}
    >
      {/* Date Number Header */}
      <div className="flex justify-end mb-1">
        <span
          className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
            ${isToday ? "bg-blue-600 text-white shadow-sm" : "text-gray-800"}
          `}
        >
          {day.getDate()}
        </span>
      </div>

      {/* Task List */}
      <SortableTaskList
        items={visibleTasks}
        listId={day.toISOString().slice(0, 10)}
        getId={(task) => task.id}
        onReorder={onReorder}
        onMove={onMove}
        renderItem={renderCompactTaskCard}
        className="flex flex-col gap-1"
      />

      {/* More Button */}
      {extraCount > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-xs text-blue-600 hover:underline mt-1 self-start"
          >
            +{extraCount} more
          </button>

          <Dialog open={showAll} onOpenChange={setShowAll}>
            <DialogContent className="max-w-md max-h-[70vh] overflow-auto p-4">
              <DialogHeader>
                <DialogTitle>
                  Tasks for {day.toDateString()}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-3 mt-4">
                {tasksForDay.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => {
                      setShowAll(false);
                      handleTaskClick(task);
                    }}
                  />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};