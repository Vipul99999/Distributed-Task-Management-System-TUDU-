// components/shared/reusablecomponents/ViewSelector/CalendarDndView.tsx
"use client";

import React, { useMemo } from "react";
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Task } from "@/types/task";
import { SortableTaskList } from "./SortableTaskList";
import { CompactTaskCard } from "../Task/CompactTaskCard";

interface CalendarDndViewProps {
  tasks: Task[];
  updateTask: (args: { id: string; updates: Partial<Task> }) => Promise<void>;
  openTaskModal: (task: Task) => void;
}

export const CalendarDndView: React.FC<CalendarDndViewProps> = ({ tasks, updateTask, openTaskModal }) => {
  const sensors = useSensors(useSensor(PointerSensor));

  // Group tasks by day (YYYY-MM-DD)
  const groupedTasks = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const dayKey = task.dueDate ? task.dueDate.slice(0, 10) : "no-date";
      if (!map.has(dayKey)) map.set(dayKey, []);
      map.get(dayKey)!.push(task);
    }
    return map;
  }, [tasks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const fromListId = active.data.current?.listId as string;
    const toListId = over.data.current?.listId as string;
    const movedTaskId = String(active.id);

    if (!fromListId || !toListId) return;

    if (fromListId === toListId) {
      // reorder in same list
      const list = groupedTasks.get(fromListId) ?? [];
      const oldIndex = list.findIndex((t) => t.id === movedTaskId);
      const newIndex = list.findIndex((t) => t.id === String(over.id));
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

      const newList = [...list];
      const [moved] = newList.splice(oldIndex, 1);
      newList.splice(newIndex, 0, moved);

      // Persist orderIndex
      for (let i = 0; i < newList.length; i++) {
        await updateTask({ id: newList[i].id, updates: { orderIndex: i } });
      }
      return;
    }

    // cross-list move: update dueDate
    const sourceList = groupedTasks.get(fromListId) ?? [];
    const movedTask = sourceList.find((t) => t.id === movedTaskId);
    if (!movedTask) return;

    const newDueDate = toListId === "no-date" ? null : `${toListId}T00:00:00.000Z`;
    // await updateTask({ id: movedTask.id, updates: { dueDate: newDueDate |undefined} });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
        {Array.from(groupedTasks.entries()).map(([dayKey, dayTasks]) => (
          <div key={dayKey} className="border rounded p-2 bg-gray-50">
            <div className="font-semibold text-sm mb-1">{dayKey}</div>
            <SortableTaskList
              items={dayTasks}
              getId={(t) => t.id}
              listId={dayKey}
              renderItem={(task) => (
                <CompactTaskCard key={task.id} task={task} onClick={() => openTaskModal(task)} />
              )}
            />
          </div>
        ))}
      </div>
    </DndContext>
  );
};
