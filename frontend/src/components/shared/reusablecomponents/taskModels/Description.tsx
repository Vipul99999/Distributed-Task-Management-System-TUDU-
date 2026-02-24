"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import { SubTask } from "@/types/task";

/*
  Improvements in this file:
  - Robust drag & drop for real-world use:
    - Added KeyboardSensor and TouchSensor in addition to PointerSensor.
    - Use sortableKeyboardCoordinates to enable keyboard reordering.
    - Drag only via the handle (listeners applied to handle only) to avoid accidental drags.
    - Stable order calculation using orderIndex; onChange emits a normalized SubTask[].
    - Smooth DragOverlay rendering of the active item.
    - Defensive index lookups (handles items missing or race conditions).
    - Minor accessibility improvements (aria labels/roles).
  - Important change: new subtasks now get ids prefixed with "temp-" (e.g. "temp-<uuid>").
    This ensures backend can detect new subtasks (server checks for ids starting with "temp-").
*/

interface DescriptionProps {
  value?: SubTask[];
  onChange: (items: SubTask[]) => void;
  maxItems?: number;
}

const Description: React.FC<DescriptionProps> = ({ value = [], onChange, maxItems = 10 }) => {
  const [input, setInput] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  // sensors: pointer, touch and keyboard for full device support
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // normalize items and ensure orderIndex is present and consistent
  const normalizeOrderIndexes = useCallback((items: SubTask[]): SubTask[] => {
    return items
      .slice()
      .sort((a, b) => {
        const ai = typeof a.orderIndex === "number" ? a.orderIndex : 0;
        const bi = typeof b.orderIndex === "number" ? b.orderIndex : 0;
        return ai - bi;
      })
      .map((item, idx) => ({ ...item, orderIndex: idx }));
  }, []);

  const getNextOrderIndex = useCallback((items: SubTask[]) => {
    if (!items.length) return 0;
    return Math.max(...items.map((it) => (typeof it.orderIndex === "number" ? it.orderIndex : -1))) + 1;
  }, []);

  const handleAdd = () => {
    if (!input.trim() || value.length >= maxItems) return;
    const now = new Date();
    const newSubtask: SubTask = {
      // IMPORTANT: prefix new IDs with "temp-" so backend can detect new items
      id: `temp-${uuidv4()}`,
      title: input.trim(),
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
      orderIndex: getNextOrderIndex(value),
      dueDate: null,
    };
    const list = normalizeOrderIndexes([...value, newSubtask]);
    onChange(list);
    setInput("");
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active?.id) setActiveId(String(active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    if (active.id === over.id) return;

    // build current sorted list and find indices by id for stable behaviour
    const sorted = normalizeOrderIndexes(value);
    const oldIndex = sorted.findIndex((i) => i.id === active.id);
    const newIndex = sorted.findIndex((i) => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      // fallback: try simple arrayMove on original provided value
      const fallbackOld = value.findIndex((i) => i.id === active.id);
      const fallbackNew = value.findIndex((i) => i.id === over.id);
      if (fallbackOld === -1 || fallbackNew === -1) return;
      const movedFallback = arrayMove(value, fallbackOld, fallbackNew);
      onChange(normalizeOrderIndexes(movedFallback));
      return;
    }

    const moved = arrayMove(sorted, oldIndex, newIndex);
    onChange(normalizeOrderIndexes(moved));
  };

  const handleToggleComplete = (id: string) => {
    const now = new Date();
    const updated = value.map((item) =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted, updatedAt: now } : item
    );
    onChange(normalizeOrderIndexes(updated));
  };

  const handleTitleChange = (id: string, title: string) => {
    const now = new Date();
    const updated = value.map((item) => (item.id === id ? { ...item, title, updatedAt: now } : item));
    onChange(normalizeOrderIndexes(updated));
  };

  const handleRemove = (id: string) => {
    const filtered = value.filter((item) => item.id !== id);
    onChange(normalizeOrderIndexes(filtered));
  };

  const handleSetDueDate = (id: string, isoDateOrNull: string | null) => {
    const now = new Date();
    const updated = value.map((item) => (item.id === id ? { ...item, dueDate: isoDateOrNull, updatedAt: now } : item));
    onChange(normalizeOrderIndexes(updated));
  };

  return (
    <div className="space-y-2 w-full">
      <InputBar
        value={input}
        onChange={setInput}
        onAdd={handleAdd}
        disabled={value.length >= maxItems}
        placeholder="Add subtask..."
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={value.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2" role="list">
            {normalizeOrderIndexes(value).map((item) => (
              <DescriptionItemRow
                key={item.id}
                item={item}
                onToggleComplete={handleToggleComplete}
                onTitleChange={handleTitleChange}
                onRemove={handleRemove}
                onSetDueDate={handleSetDueDate}
              />
            ))}
          </ul>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="p-2 bg-white rounded-md shadow-lg border">
              {/* Mirror of the item for visual continuity */}
              <div className="flex items-center gap-2 min-w-[220px]">
                <span className="text-gray-400 px-1 select-none">⠿</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {value.find((i) => i.id === activeId)?.title ?? "Moving..."}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Description;

/* ----------------------
   InputBar Component
   ---------------------- */
interface InputBarProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  disabled: boolean;
  placeholder?: string;
}

const InputBar: React.FC<InputBarProps> = ({ value, onChange, onAdd, disabled, placeholder }) => (
  <div className="flex flex-col sm:flex-row gap-2 mb-2">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
      placeholder={placeholder}
      className="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Add subtask"
    />
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      className={`px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      aria-disabled={disabled}
    >
      Add
    </button>
  </div>
);

/* ----------------------
   DescriptionItemRow Component
   ---------------------- */
interface DescriptionItemRowProps {
  item: SubTask;
  onToggleComplete: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onRemove: (id: string) => void;
  onSetDueDate: (id: string, isoDateOrNull: string | null) => void;
}

const DescriptionItemRow: React.FC<DescriptionItemRowProps> = ({
  item,
  onToggleComplete,
  onTitleChange,
  onRemove,
  onSetDueDate,
}) => {
  // useSortable gives us listeners & attributes. We'll only apply listeners to the handle.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: item,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "manipulation",
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 px-2 py-1 border rounded-md bg-white shadow-sm relative"
      role="listitem"
      aria-roledescription="subtask"
    >
      <DraggableHandle listeners={listeners} />
      <input
        type="checkbox"
        checked={!!item.isCompleted}
        onChange={() => onToggleComplete(item.id)}
        className="w-4 h-4 sm:w-5 sm:h-5"
        aria-label={`Toggle subtask ${item.title}`}
      />
      <input
        type="text"
        value={item.title}
        onChange={(e) => onTitleChange(item.id, e.target.value)}
        placeholder="Subtask title..."
        className="flex-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 px-1 py-0.5 rounded"
        aria-label={`Subtask title ${item.title}`}
      />

      <div className="flex items-center gap-2 ml-2">
        {item.dueDate ? (
          <div className="text-xs text-gray-600 px-2 py-0.5 rounded bg-gray-50">
            {formatDateLabel(item.dueDate)}
          </div>
        ) : null}

        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 font-bold hover:text-red-600 px-1"
          aria-label={`Remove subtask ${item.title}`}
        >
          ×
        </button>

        <MoreMenu id={item.id} currentDueDate={item.dueDate ?? null} onSetDueDate={onSetDueDate} />
      </div>
    </li>
  );
};

/* ----------------------
   DraggableHandle Component
   - only this element receives the drag listeners, preventing accidental drags.
   ---------------------- */
interface DraggableHandleProps {
  listeners?: ReturnType<typeof useSortable>["listeners"];
}

const DraggableHandle: React.FC<DraggableHandleProps> = ({ listeners }) => (
  <button
    {...(listeners || {})}
    aria-label="Drag handle"
    title="Drag"
    className="cursor-grab px-2 py-1 text-gray-400 hover:text-gray-600 select-none"
  >
    ⠿
  </button>
);

/* ----------------------
   MoreMenu Component (compact)
   ---------------------- */
interface MoreMenuProps {
  id: string;
  currentDueDate: string | null; // ISO string or null
  onSetDueDate: (id: string, isoDateOrNull: string | null) => void;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ id, currentDueDate, onSetDueDate }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toDateInputValue = (isoOrNull: string | null) => {
    if (!isoOrNull) return "";
    try {
      return new Date(isoOrNull).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      onSetDueDate(id, null);
    } else {
      const iso = new Date(`${val}T00:00:00`).toISOString();
      onSetDueDate(id, iso);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="px-2 py-1 rounded hover:bg-gray-100"
        title="More"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 bg-white border rounded shadow-md p-2">
          <label className="block text-xs text-gray-600 mb-1">Set due date</label>
          <input
            type="date"
            value={toDateInputValue(currentDueDate)}
            onChange={handleDateChange}
            className="w-full px-2 py-1 border rounded text-sm mb-2"
            aria-label="Set subtask due date"
          />
          <div className="flex gap-2">
            <button
              className="flex-1 px-2 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => {
                onSetDueDate(id, null);
                setOpen(false);
              }}
            >
              Clear
            </button>
            <button className="flex-1 px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ----------------------
   Small util: formatDateLabel
   ---------------------- */
const formatDateLabel = (iso: string | null) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 10);
  } catch {
    return String(iso);
  }
};