"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

export interface SortableTaskListProps<T> {
  items: T[];
  listId: string; // unique identifier for this list (e.g., date or column)
  getId: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  onReorder?: (newItems: T[]) => void; // same-list reorder callback
  onMove?: (item: T, toListId: string) => void; // cross-list drag callback
  className?: string;
}

export function SortableTaskList<T>({
  items,
  listId,
  getId,
  renderItem,
  onReorder,
  onMove,
  className,
}: SortableTaskListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeListId = active.data.current?.listId as string;
    const overListId = over.data.current?.listId as string;

    if (activeListId === overListId) {
      // Reorder within the same list
      const oldIndex = items.findIndex((item) => getId(item) === active.id);
      const newIndex = items.findIndex((item) => getId(item) === over.id);

      if (oldIndex !== newIndex && onReorder) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems);
      }
    } else {
      // Moving to another list
      if (onMove) {
        const movedItem = items.find((item) => getId(item) === active.id);
        if (movedItem) onMove(movedItem, overListId);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(getId)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item, index) => (
            <SortableItem key={getId(item)} id={getId(item)} listId={listId}>
              {renderItem(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
