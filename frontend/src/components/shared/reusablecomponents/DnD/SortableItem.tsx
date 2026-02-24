"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string | number;          // unique id of the item
  listId: string;               // id of the list it belongs to
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;           // non-draggable item
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  listId,
  children,
  className,
  style,
  disabled = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    data: { listId },
    disabled,
  });

  const dndStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "manipulation",
    ...style,
  };

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      className={className}
      {...attributes}
      {...listeners}
      role="listitem"
    >
      {children}
    </div>
  );
};
