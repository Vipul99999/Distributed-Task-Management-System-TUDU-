"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Task,
  TaskLabel,
  StatusFilter,
  PriorityFilter,
  PinnedFilter,
  TypeFilter,
} from "@/types/task";
import { TaskCard } from "./TaskCard";
import { TaskFilters } from "../TaskFilters/TaskFilters";
import { useTasks } from "@/hooks/useTasks";
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
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { parseISO, isWithinInterval } from "date-fns";

type CompletionFilter = StatusFilter; // reuse StatusFilter type

interface Props {
  availableLabels?: TaskLabel[];
  filter?: {dateFrom?: string; dateTo?: string; completed ?: string}; // optional date range filter
}



export const TaskList: React.FC<Props> = ({ availableLabels = [] ,filter}) => {
  const { tasks = [], isLoading, isError, updateTask, deleteTask, reorderTasks } =
    useTasks();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [completion, setCompletion] = useState<CompletionFilter>("all");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [pinned, setPinned] = useState<PinnedFilter>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string | undefined>(filter?.dateFrom);
const [dateTo, setDateTo] = useState<string | undefined>(filter?.dateTo);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
  setDateFrom(filter?.dateFrom);
  setDateTo(filter?.dateTo);
  setCompletion((filter?.completed as CompletionFilter) ?? "all"); 
}, [filter]);


  // sensors (Pointer + Touch + Keyboard): provide sortableKeyboardCoordinates for keyboard support
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Helper: safe parse a date string to Date | null
  const safeParseISO = useCallback((s?: string | null) => {
    if (!s) return null;
    try {
      return parseISO(s);
    } catch {
      return null;
    }
  }, []);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

    const res = tasks
      .filter((t) => {
        // Search (title)
        if (q && !t.title.toLowerCase().includes(q)) return false;

        // Status
        if (completion === "completed" && !t.isCompleted) return false;
        if (completion === "pending" && t.isCompleted) return false;

        // Priority
        if (priority !== "all" && t.priority !== priority) return false;

        // Pinned
        if (pinned === "pinned" && !t.pinned) return false;
        if (pinned === "unpinned" && t.pinned) return false;

        // Type
        if (type !== "all" && t.type !== type) return false;

        // Labels (all selected labels must be present on task)
        if (selectedLabelIds.length) {
          const taskLabelIds = t.labels?.map((l) => l.labelId) ?? [];
          if (!selectedLabelIds.every((id) => taskLabelIds.includes(id)))
            return false;
        }

        // Date range (uses dueDate)
        if (dateFrom || dateTo) {
          const taskDate = t.dueDate ? safeParseISO(t.dueDate) : null;
          if (!taskDate) return false;
          const from = dateFrom ? safeParseISO(dateFrom) ?? undefined : undefined;
          const to = dateTo ? safeParseISO(dateTo) ?? undefined : undefined;
          // Define interval fallback bounds
          const start = from ?? new Date(0);
          const end = to ?? new Date(8640000000000000); // max date
          if (!isWithinInterval(taskDate, { start, end })) return false;
        }

        return true;
      })
      .slice(); // copy to avoid mutating original

    // Sort: prefer orderIndex (if different), otherwise fallback to createdAt string comparison
    res.sort((a, b) => {
      const ai = a.orderIndex ?? 0;
      const bi = b.orderIndex ?? 0;
      const diff = ai - bi;
      if (diff !== 0) return diff;
      if (a.createdAt && b.createdAt) return a.createdAt.localeCompare(b.createdAt);
      return a.id.localeCompare(b.id);
    });

    return res;
  }, [
    tasks,
    debouncedSearch,
    completion,
    priority,
    pinned,
    type,
    selectedLabelIds,
    dateFrom,
    dateTo,
    safeParseISO,
  ]);

  
  // Sortable child wrapper — ensures each child registers with dnd-kit
  const SortableItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
      data: { id },
    });

    const style: React.CSSProperties = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition,
      opacity: isDragging ? 0.6 : 1,
      touchAction: "manipulation",
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        {/* Apply listeners on a wrapper; if you want a handle, pass listeners into TaskCard */}
        <div {...listeners}>{children}</div>
      </div>
    );
  };

  // Drag start (useful for overlay)
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (active?.id) setActiveId(String(active.id));
  }, []);

  // Drag and drop end handler
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over || active.id === over.id) return;

      const oldIndex = filteredTasks.findIndex((t) => t.id === String(active.id));
      const newIndex = filteredTasks.findIndex((t) => t.id === String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;

      const newOrder = arrayMove(filteredTasks, oldIndex, newIndex);
      const payload = newOrder.map((t, i) => ({ id: t.id, orderIndex: i }));

      try {
        // Use the hook's reorderTasks mutation; it should handle optimistic updates & rollback
        if (reorderTasks && typeof (reorderTasks ).mutateAsync === "function") {
          await (reorderTasks ).mutateAsync(payload);
        } else if (reorderTasks && typeof (reorderTasks ).mutate === "function") {
          (reorderTasks ).mutate(payload);
        } else {
          console.warn("reorderTasks mutation not available on hook; no server call made.");
        }
      } catch (err) {
        console.error("Task reorder failed:", err);
      }
    },
    [filteredTasks, reorderTasks]
  );

  if (isLoading) return <div className="p-4">Loading tasks…</div>;
  if (isError) return <div className="p-4 text-red-600">Failed to load tasks</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <TaskFilters
        status={completion}
        priority={priority}
        pinned={pinned}
        type={type}
        searchText={search}
        dateFrom={dateFrom}
        dateTo={dateTo}
        labels={availableLabels}
        selectedLabelIds={selectedLabelIds}
        onChangeStatus={setCompletion}
        onChangePriority={setPriority}
        onChangePinned={setPinned}
        onChangeType={setType}
        onChangeSearchText={setSearch}
        onChangeDateFrom={setDateFrom}
        onChangeDateTo={setDateTo}
        onChangeLabels={setSelectedLabelIds}
      />

      {/* Tasks Grid (DND-enabled) */}
      <div ref={containerRef}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={filteredTasks.map((t) => t.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTasks.map((task) => (
                <SortableItem key={task.id} id={task.id}>
                  <TaskCard
                    task={task}
                    onToggleComplete={() =>
                      updateTask({ id: task.id, updates: { isCompleted: !task.isCompleted } })
                    }
                    onDelete={() => deleteTask(task.id)}
                    onEdit={() => console.log("Open Task Modal for", task.id)}
                    onTogglePinned={() => updateTask({ id: task.id, updates: { pinned: !task.pinned } })}
                    onChangePriority={(p) => updateTask({ id: task.id, updates: { priority: p } })}
                  />
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default TaskList;