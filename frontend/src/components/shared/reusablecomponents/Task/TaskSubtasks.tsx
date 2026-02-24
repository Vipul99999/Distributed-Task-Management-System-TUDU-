"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Task, SubTask } from "@/types/task";
import Description from "../taskModels/Description";
import { useUpdateSubtasks } from "@/hooks/useUpdateSubtasks ";

/*
  TaskSubtasks
  - Reuses the existing Description component to render, add, edit, delete and reorder subtasks.
  - Ensures newly added subtasks have temp- ids (Description now prefixes new ids with temp-).
  - Keeps a local copy while editing (optimistic UI) and debounces sync to backend.
  - Syncs using useUpdateSubtasks.mutateAsync({ taskId, payload }) where payload items are:
      { id?: string, title, isCompleted?, orderIndex?, dueDate?: Date | null }
*/

interface Props {
  task: Task;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TaskSubtasks: React.FC<Props> = ({ task, open, setOpen }) => {
  const updateSubtasks = useUpdateSubtasks();
  const syncTimer = useRef<number | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // normalize incoming subtasks for Description (dueDate: ISO string | null)
  const initial = useMemo(
    () =>
      (task.subtasks || []).map<SubTask>((s) => ({
        id: String(s.id),
        title: s.title,
        isCompleted: !!s.isCompleted,
        orderIndex: typeof s.orderIndex === "number" ? s.orderIndex : undefined,
        createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
        updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
        dueDate: s.dueDate ? new Date(s.dueDate).toISOString() : null,
      })),
    [task.subtasks]
  );

  const [local, setLocal] = useState<SubTask[]>(initial);
  const [dirty, setDirty] = useState(false);

  // Keep local in sync when server changes and we are not editing
  useEffect(() => {
    if (!dirty) setLocal(initial);
  }, [initial, dirty]);

  // Debounced sync to backend
  const scheduleSync = useCallback(() => {
    if (syncTimer.current) {
      window.clearTimeout(syncTimer.current);
      syncTimer.current = null;
    }
    syncTimer.current = window.setTimeout(() => {
      void syncToBackend();
    }, 1200) as unknown as number;
  }, []);

  useEffect(() => {
    return () => {
      if (syncTimer.current) {
        window.clearTimeout(syncTimer.current);
        syncTimer.current = null;
      }
    };
  }, []);

  const buildPayload = useCallback(
    (items: SubTask[]) =>
      items.map((s, idx) => ({
        // Keep the id if present (including temp- prefixed ids) so backend can detect new items.
        id: s.id ? String(s.id) : undefined,
        title: s.title,
        isCompleted: !!s.isCompleted,
        orderIndex: typeof s.orderIndex === "number" ? s.orderIndex : idx,
        dueDate: s.dueDate ? new Date(s.dueDate) : null,
      })),
    []
  );

  const syncToBackend = useCallback(async () => {
    if (!dirty) return;
    try {
      const payload = buildPayload(local);
      const result = await updateSubtasks.mutateAsync({
        taskId: task.id,
        payload,
      });

      // If backend returns saved subtasks, normalize back to local shape
      if (Array.isArray(result)) {
        setLocal(
          result.map((r) => ({
            id: String(r.id),
            title: r.title,
            isCompleted: !!r.isCompleted,
            orderIndex: typeof r.orderIndex === "number" ? r.orderIndex : undefined,
            createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
            updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
            dueDate: r.dueDate ? new Date(r.dueDate).toISOString() : null,
          }))
        );
      }

      setDirty(false);
    } catch (err) {
      console.error("TaskSubtasks: sync failed", err);
      // keep dirty true to retry later
    }
  }, [buildPayload, dirty, local, task.id, updateSubtasks]);

  // outside click: sync and close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        void syncToBackend();
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, syncToBackend, setOpen]);

  // Hook up handlers that Description expects: onChange provides full SubTask[].
  const handleChange = useCallback(
    (items: SubTask[]) => {
      setLocal(items);
      setDirty(true);
      scheduleSync();
    },
    [scheduleSync]
  );

  // Explicit save (e.g. close)
  const handleClose = useCallback(async () => {
    await syncToBackend();
    setOpen(false);
  }, [setOpen, syncToBackend]);

  // Derive progress
  const completedCount = local.reduce((c, s) => c + (s.isCompleted ? 1 : 0), 0);
  const totalCount = local.length;
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="relative mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <div className="flex items-center gap-2 w-full">
          <div className="font-medium">
            {completedCount}/{totalCount}
          </div>
          <div className="flex-1 bg-gray-200 h-2 rounded overflow-hidden">
            <div
              className="h-2 bg-green-500 rounded transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="ml-2 flex items-center gap-2">
          <button
            onClick={() => {
              if (open) {
                void syncToBackend();
              }
              setOpen(!open);
            }}
            className="text-xs text-blue-600 ml-2"
            aria-pressed={open}
          >
            {open ? "Hide" : totalCount > 0 ? "Show Subtasks" : "Add Subtasks"}
          </button>
        </div>
      </div>

      {open && (
        <div ref={popoverRef} className="absolute left-0 mt-1 w-[95vw] sm:w-80 bg-white border rounded-lg shadow-lg p-3 max-h-72 overflow-auto z-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-sm">{task.title} Subtasks</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                aria-label="Close subtasks"
                className="text-gray-600 hover:text-gray-800"
                title="Close"
              >
                ×
              </button>
            </div>
          </div>

          <Description value={local} onChange={handleChange} maxItems={50} />

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={async () => {
                await syncToBackend();
              }}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Save
            </button>
            <button
              onClick={() => {
                // revert local to server state
                setLocal(initial);
                setDirty(false);
                setOpen(false);
              }}
              className="px-3 py-1 text-sm bg-white rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSubtasks;