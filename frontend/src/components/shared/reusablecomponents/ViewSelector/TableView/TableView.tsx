"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { TaskFilters, TypeFilter } from "@/components/shared/reusablecomponents/TaskFilters/TaskFilters";
import { TaskModal } from "../../taskModels/TaskModels";
import { useTasks } from "@/hooks/useTasks";
import { Task, StatusFilter, PriorityFilter, PinnedFilter, TaskLabel } from "@/types/task";

interface Props {
  availableLabels?: TaskLabel[];
  filter?: {dateFrom?: string; dateTo?: string}; // optional date range filter
}
export const TableView: React.FC<Props> = ({ availableLabels = [] ,filter}) => {
  const { tasks, isLoading, isError, updateTask, createTask, deleteTask } = useTasks();

  const [filters, setFilters] = useState({
    status: "all" as StatusFilter | "all",
    priority: "all" as PriorityFilter | "all",
    pinned: "all" as PinnedFilter | "all",
    type: "all" as TypeFilter | "all",
    labels: [] as string[],
    searchText: "",
     dateFrom: filter?.dateFrom,
    dateTo: filter?.dateTo,
  });

  useEffect(() => {
      setFilters((prev) => ({
        ...prev,
        dateFrom: filter?.dateFrom,
        dateTo: filter?.dateTo,
      }));
    }, [filter]);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [editBuffer, setEditBuffer] = useState<Record<string, Partial<Task>>>({});

  // Debounce inline edits
  useEffect(() => {
    if (Object.keys(editBuffer).length === 0) return;
    const timer = setTimeout(() => {
      Object.entries(editBuffer).forEach(([id, updates]) => updateTask({ id, updates }));
      setEditBuffer({});
    }, 500);
    return () => clearTimeout(timer);
  }, [editBuffer, updateTask]);

  // Task filtering logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filters.searchText && !t.title.toLowerCase().includes(filters.searchText.toLowerCase())) return false;
        if (filters.status === "completed" && !t.isCompleted) return false;
        if (filters.status === "pending" && t.isCompleted) return false;
        if (filters.priority !== "all" && t.priority !== filters.priority) return false;
        if (filters.pinned === "pinned" && !t.pinned) return false;
        if (filters.pinned === "unpinned" && t.pinned) return false;
        if (filters.type !== "all" && t.type !== filters.type) return false;
        if (filters.labels.length > 0) {
          const labelIds = t.labels?.map((l) => l.labelId) ?? [];
          if (!filters.labels.every((id) => labelIds.includes(id))) return false;
        }
        if (filters.dateFrom || filters.dateTo) {
          const taskDate = t.dueDate ? parseISO(t.dueDate) : null;
          if (!taskDate) return false;
          const from = filters.dateFrom ? parseISO(filters.dateFrom) : undefined;
          const to = filters.dateTo ? parseISO(filters.dateTo) : undefined;
          if (!isWithinInterval(taskDate, { start: from ?? new Date(0), end: to ?? new Date(9999, 11, 31) })) return false;
        }
        return true;
      })
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [tasks, filters]);

  // Stable callbacks for selection
  const openModal = useCallback((task?: Task) => setModalTask(task ?? null), []);
  const closeModal = useCallback(() => setModalTask(null), []);
  const toggleSelect = useCallback(
    (taskId: string) =>
      setSelectedTasks((prev) => {
        const copy = new Set(prev);
        copy.has(taskId) ? copy.delete(taskId) : copy.add(taskId);
        return copy;
      }),
    []
  );
  const selectAll = useCallback(() => setSelectedTasks(new Set(filteredTasks.map((t) => t.id))), [filteredTasks]);
  const clearSelection = useCallback(() => setSelectedTasks(new Set()), []);

  const deleteSelected = useCallback(async () => {
    for (const id of selectedTasks) await deleteTask(id);
    setSelectedTasks(new Set());
  }, [selectedTasks, deleteTask]);

  if (isLoading) return <p>Loading tasks...</p>;
  if (isError) return <p>Error loading tasks!</p>;

  return (
    <div className="flex flex-col h-full" role="table" aria-label="Task table">
      {/* Top actions + filters */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        <div className="flex flex-wrap gap-2">
          
          
          {selectedTasks.size > 0 && (
            <button
              className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={deleteSelected}
              aria-label={`Delete Selected (${selectedTasks.size})`}
            >
              Delete Selected ({selectedTasks.size})
            </button>
          )}
          <button className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400" onClick={selectAll} aria-label="Select all tasks">
            Select All
          </button>
          <button className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400" onClick={clearSelection} aria-label="Clear task selection">
            Clear Selection
          </button>
        </div>
        <div className="flex-shrink-0 mb-2">
          <TaskFilters
            status={filters.status}
            priority={filters.priority}
            pinned={filters.pinned}
            type={filters.type}
            labels={tasks.flatMap((t) => t.labels ?? [])}
            selectedLabelIds={filters.labels}
            searchText={filters.searchText}
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onChangeStatus={(v) => setFilters((f) => ({ ...f, status: v }))}
            onChangePriority={(v) => setFilters((f) => ({ ...f, priority: v }))}
            onChangePinned={(v) => setFilters((f) => ({ ...f, pinned: v }))}
            onChangeType={(v) => setFilters((f) => ({ ...f, type: v }))}
            onChangeLabels={(ids) => setFilters((f) => ({ ...f, labels: ids }))}
            onChangeSearchText={(v) => setFilters((f) => ({ ...f, searchText: v }))}
            onChangeDateFrom={(v) => setFilters((f) => ({ ...f, dateFrom: v }))}
            onChangeDateTo={(v) => setFilters((f) => ({ ...f, dateTo: v }))}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border rounded shadow-sm">
        <table className="min-w-max w-full border-collapse" role="grid">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="p-2 border">Select</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Priority</th>
              <th className="p-2 border">Pinned</th>
              <th className="p-2 border">Due Date</th>
              <th className="p-2 border">Labels</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-4 text-gray-500">No tasks found.</td>
              </tr>
            )}
            {filteredTasks.map((task) => (
              <tr key={task.id} className={`${selectedTasks.has(task.id) ? "bg-blue-50" : ""} hover:bg-gray-50`}>
                <td className="p-1 border text-center">
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(task.id)}
                    onChange={() => toggleSelect(task.id)}
                    aria-label={`Select task ${task.title}`}
                  />
                </td>
                <td className="p-1 border">
                  <input
                    type="text"
                    value={task.title}
                    aria-label={`Edit task title: ${task.title}`}
                    className={`w-full border px-1 py-0.5 rounded text-sm ${task.isCompleted ? "line-through text-gray-400" : ""}`}
                    onChange={(e) =>
                      setEditBuffer((b) => ({ ...b, [task.id]: { ...b[task.id], title: e.target.value } }))
                    }
                  />
                </td>
                <td className="p-1 border">
                  <select
                    value={task.priority}
                    aria-label={`Edit priority for ${task.title}`}
                    className="border px-1 py-0.5 rounded text-sm"
                    onChange={(e) =>
                      setEditBuffer((b) => ({ ...b, [task.id]: { ...b[task.id], priority: e.target.value as Task["priority"] } }))
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </td>
                <td className="p-1 border text-center">
                  <input
                    type="checkbox"
                    checked={task.pinned}
                    aria-label={`Pin task ${task.title}`}
                    onChange={(e) =>
                      setEditBuffer((b) => ({ ...b, [task.id]: { ...b[task.id], pinned: e.target.checked } }))
                    }
                  />
                </td>
                <td className="p-1 border">
                  <input
                    type="date"
                    value={task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""}
                    aria-label={`Edit due date for ${task.title}`}
                    className="border px-1 py-0.5 rounded text-sm"
                    onChange={(e) =>
                      setEditBuffer((b) => ({
                        ...b,
                        [task.id]: { ...b[task.id], dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined },
                      }))
                    }
                  />
                </td>
                <td className="p-1 border flex flex-wrap gap-1">
                  {task.labels?.map((l) => (
                    <span
                      key={l.labelId}
                      className="px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                      style={{ backgroundColor: l.label?.color || "#eee" }}
                    >
                      {l.label?.name}
                    </span>
                  ))}
                </td>
                <td className="p-1 border text-center">{task.type}</td>
                <td className="p-1 border flex gap-1">
                  <button
                    className="text-red-500 hover:text-red-700 text-sm"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete task: ${task.title}`}
                  >
                    Delete
                  </button>
                  <button
                    className="text-blue-500 hover:text-blue-700 text-sm"
                    onClick={() => openModal(task)}
                    aria-label={`Edit task: ${task.title}`}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalTask && (
        <TaskModal
          open={!!modalTask}
          initialData={modalTask}
          onClose={closeModal}
          onSubmit={async (data) => {
            await updateTask({ id: modalTask.id, updates: data });
            closeModal();
          }}
        />
      )}
    </div>
  );
};
