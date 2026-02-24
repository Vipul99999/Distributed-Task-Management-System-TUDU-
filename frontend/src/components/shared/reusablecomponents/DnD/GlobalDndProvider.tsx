"use client";

import React from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type CollisionDetection,
} from "@dnd-kit/core";

interface GlobalDndProviderProps {
  children: React.ReactNode;
  onDragEnd?: (event: DragEndEvent) => void;
  collisionDetection?: CollisionDetection;
}

export const GlobalDndProvider: React.FC<GlobalDndProviderProps> = ({
  children,
  onDragEnd,
  collisionDetection,
}) => {
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragEnd={onDragEnd}
    >
      {children}
    </DndContext>
  );
};
