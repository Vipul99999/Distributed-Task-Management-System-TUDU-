"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { TaskFormData, Task, SubTask as SubTaskForm } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import Description from "./Description";
import { PrioritySelect } from "./PrioritySelect";
import { DueDateInput } from "./DueDateInput";
import { DueTimeInput } from "./DueTimeInput";
import { PinCheckbox } from "./PinCheckbox";
import ReminderSettings from "../ReminderSettings";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: TaskFormData & { id?: string; subtasks?: SubTaskForm[] };
  /**
   * Optional onSubmit: if it returns `true` (or a Promise resolving to true),
   * it signals that the parent handled persistence and TaskModal will NOT call the backend.
   * If it returns `false` / `undefined`, TaskModal will perform create/update itself.
   */
  onSubmit?: (data: TaskFormData) => Promise<boolean | void> | boolean | void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  open,
  onClose,
  initialData,
  onSubmit,
}) => {
  const today = useMemo(() => new Date().toISOString().split("T")[0], [open]);
  const { createTask, updateTask } = useTasks();
  const { user, isLoggedIn, loading: userLoading } = useCurrentUser();

  const titleRef = useRef<HTMLInputElement | null>(null);

  const emptyState = (): TaskFormData => ({
    title: "",
    subtasks: [],
    priority: "LOW",
    recurrence: "NONE",
    type: "PERSONAL",
    dueDate: today,
    dueTime: "",
    reminderEnabled: false,
    reminderTime: "",
    pinned: false,
  });

  const [formState, setFormState] = useState<TaskFormData>(emptyState());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const originalFormRef = useRef<TaskFormData>(emptyState());

  const normalizeIncomingSubtask = (s: SubTaskForm): SubTaskForm => ({
    id: s.id ?? undefined,
    title: s.title ?? "",
    isCompleted: !!s.isCompleted,
    orderIndex: typeof s.orderIndex === "number" ? s.orderIndex : undefined,
    dueDate: s.dueDate ? String(s.dueDate) : null,
    createdAt: s.createdAt ? (s.createdAt instanceof Date ? s.createdAt : new Date(s.createdAt)) : new Date(),
    updatedAt: s.updatedAt ? (s.updatedAt instanceof Date ? s.updatedAt : new Date(s.updatedAt)) : new Date(),
  });

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      const {
        title = "",
        subtasks = [],
        priority = "LOW",
        recurrence = "NONE",
        type = "PERSONAL",
        dueDate = today,
        dueTime = "",
        reminderEnabled = false,
        reminderTime = "",
        pinned = false,
      } = initialData as TaskFormData & { subtasks?: SubTaskForm[] };

      const normalizedSubtasks = (subtasks || []).map(normalizeIncomingSubtask);

      const snapshot: TaskFormData = {
        title,
        subtasks: normalizedSubtasks,
        priority,
        recurrence,
        type,
        dueDate,
        dueTime,
        reminderEnabled,
        reminderTime,
        pinned,
      };

      setFormState(snapshot);
      originalFormRef.current = snapshot;
    } else {
      const snapshot = emptyState();
      setFormState(snapshot);
      originalFormRef.current = snapshot;
    }

    setTimeout(() => titleRef.current?.focus(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  useEffect(() => {
    if (error) setError(null);
  }, [formState.title, formState.dueDate, formState.dueTime]);

  const handleChange = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!formState.title.trim()) {
      setError("Title is required.");
      return false;
    }
    return true;
  };

  const buildPayloadFromForm = (): Partial<Task> => {
   let dueDateTime: string | undefined = undefined;

  if (formState.dueDate) {
    const dateString = formState.dueTime
      ? `${formState.dueDate}T${formState.dueTime}:00`
      : `${formState.dueDate}T00:00:00`;
    const d = new Date(dateString);
    if (!isNaN(d.valueOf())) {
      dueDateTime = d.toISOString();
    } else {
      dueDateTime = undefined;
    }
  }

    const subtasksPayload =
      (formState.subtasks || []).map((st, idx) => ({
        id: st.id,
        title: st.title,
        isCompleted: !!st.isCompleted,
        orderIndex: typeof st.orderIndex === "number" ? st.orderIndex : idx,
        dueDate: st.dueDate ?? null,
      })) || [];

    const payload: Partial<Task> = {
      ...(user?.userId ? { userId: user.userId } : {}),
      title: formState.title,
      type: formState.type,
      priority: formState.priority,
      recurrence: formState.recurrence,
      pinned: formState.pinned ?? false,
      isCompleted: false,
      subtasks: subtasksPayload as SubTaskForm[],
      labels: [],
      dueDate: dueDateTime,
      lastSyncedAt: new Date().toISOString(),
    };
    return payload;
  };

  // NEW: onSubmitHandler that allows parent to handle persistence optionally.
  const onSubmitHandler = async () => {
    if (isSaving) return;
    if (!validate()) return;

    // require user id when creating
    if (!initialData?.id) {
      if (userLoading) {
        setError("Please wait — user information is loading.");
        return;
      }
      if (!user?.userId) {
        setError("Cannot create task: user not identified. Please sign in.");
        alert("Cannot create task: user not identified. Please sign in.");
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    const payload = buildPayloadFromForm();
    console.info("[TaskModal] submit payload:", payload);

    try {
      let parentHandled = false;
      if (onSubmit) {
        // if parent returns true, assume it handled persistence
        const maybeHandled = await Promise.resolve(onSubmit(formState));
        if (maybeHandled === true) parentHandled = true;
      }

      if (!parentHandled) {
        if (initialData?.id) {
          console.info("[TaskModal] calling updateTask");
          console.log('Preparing to update:', { id: initialData?.id, payload });

          await updateTask({ id: initialData.id, updates: payload });
        } else {
          console.info("[TaskModal] calling createTask");
          await createTask(payload);
        }
      }

      setFormState(emptyState());
      originalFormRef.current = emptyState();
      onClose();
    } catch (err: unknown) {
      console.error("[TaskModal] save error:", err);
      let message = "An unexpected error occurred while saving.";
      if (err instanceof Error) message = err.message;
      else if (typeof err === "string") message = err;
      else {
        try {
          message = JSON.stringify(err);
        } catch {
          message = String(err);
        }
      }
      setError(message);
      alert("Failed to save task: " + message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-xl overflow-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>Set details, reminders, and schedule</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-2">
          <Input
            ref={titleRef}
            placeholder="Task title"
            value={formState.title}
            onChange={(e) => handleChange("title", e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "task-title-error" : undefined}
            autoFocus
          />
          {error && (
            <div id="task-title-error" role="alert" className="text-sm text-red-600">
              {error}
            </div>
          )}

          <Description
            value={formState.subtasks || []}
            onChange={(val) => handleChange("subtasks", val)}
            maxItems={10}
          />

          <PrioritySelect
            value={formState.priority}
            onChange={(val) => handleChange("priority", val)}
          />

          <div className="grid grid-cols-2 gap-4">
            <DueDateInput
              value={formState.dueDate || ""}
              onChange={(val) => handleChange("dueDate", val)}
              minDate={today}
            />
            <DueTimeInput
              value={formState.dueTime || ""}
              onChange={(val) => handleChange("dueTime", val)}
              formatTime={(time24) => {
                if (!time24) return "";
                const [hh, mm] = time24.split(":");
                let h = parseInt(hh, 10);
                const suffix = h >= 12 ? "PM" : "AM";
                h = h % 12 || 12;
                return `${h}:${mm} ${suffix}`;
              }}
            />
          </div>

          <ReminderSettings
            initialRecurrence={String(formState.recurrence || "NONE")}
            initialTime={formState.reminderTime ?? null}
            onSave={(data) => {
              const { recurrence, reminderTime } = data;
              handleChange("recurrence", recurrence as TaskFormData["recurrence"]);
              handleChange("reminderTime", (reminderTime ?? "") as TaskFormData["reminderTime"]);
              handleChange("reminderEnabled", (recurrence !== "NONE") as TaskFormData["reminderEnabled"]);
            }}
          />

          <PinCheckbox
            value={formState.pinned || false}
            onChange={(val) => handleChange("pinned", val)}
          />

          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              onClick={onSubmitHandler}
              disabled={isSaving || !formState.title.trim()}
            >
              {isSaving ? "Saving..." : "Save Task"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setFormState(originalFormRef.current);
                onClose();
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;