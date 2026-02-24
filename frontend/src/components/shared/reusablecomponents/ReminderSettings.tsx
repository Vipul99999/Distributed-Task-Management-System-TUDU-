"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type RecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";

export type FormValues = {
  reminderEnabled: boolean;
  recurrence: RecurrenceType;
  reminderTime: string | null;
  reminderDays: string[]; // e.g. ["Mon","Wed"]
  reminderDay?: number; // 1..31
  customInterval?: number; // days
};

function parseRecurrence(recurrence: string): Partial<FormValues> {
  if (!recurrence || recurrence === "NONE") {
    return { reminderEnabled: false, recurrence: "NONE", reminderDays: [], reminderTime: null };
  }
  if (recurrence === "DAILY")
    return { reminderEnabled: true, recurrence: "DAILY", reminderDays: [], reminderTime: null };
  if (recurrence.startsWith("WEEKLY:"))
    return {
      reminderEnabled: true,
      recurrence: "WEEKLY",
      reminderDays: recurrence.replace("WEEKLY:", "").split(",").filter(Boolean),
      reminderTime: null,
    };
  if (recurrence.startsWith("MONTHLY:"))
    return {
      reminderEnabled: true,
      recurrence: "MONTHLY",
      reminderDay: parseInt(recurrence.replace("MONTHLY:", ""), 10),
      reminderDays: [],
      reminderTime: null,
    };
  if (recurrence.startsWith("CUSTOM:"))
    return {
      reminderEnabled: true,
      recurrence: "CUSTOM",
      customInterval: parseInt(recurrence.replace("CUSTOM:", ""), 10),
      reminderDays: [],
      reminderTime: null,
    };
  return { reminderEnabled: false, recurrence: "NONE", reminderDays: [], reminderTime: null };
}

function serializeRecurrence(data: FormValues): string {
  if (!data.reminderEnabled) return "NONE";
  switch (data.recurrence) {
    case "DAILY":
      return "DAILY";
    case "WEEKLY":
      return data.reminderDays.length > 0 ? `WEEKLY:${data.reminderDays.join(",")}` : "WEEKLY";
    case "MONTHLY":
      return data.reminderDay ? `MONTHLY:${data.reminderDay}` : "MONTHLY";
    case "CUSTOM":
      return data.customInterval ? `CUSTOM:${data.customInterval}` : "CUSTOM";
    default:
      return "NONE";
  }
}

interface ReminderSettingsProps {
  initialRecurrence?: string;
  initialTime?: string | null;
  onSave: (data: { recurrence: string; reminderTime: string | null }) => void;
}

export default function ReminderSettings({
  initialRecurrence = "NONE",
  initialTime = null,
  onSave,
}: ReminderSettingsProps) {
  const parsed = parseRecurrence(initialRecurrence);

  const { control, watch, setValue, getValues } = useForm<FormValues>({
    defaultValues: {
      reminderEnabled: parsed.reminderEnabled ?? false,
      recurrence: (parsed.recurrence as RecurrenceType) || "NONE",
      reminderTime: initialTime ?? parsed.reminderTime ?? null,
      reminderDays: parsed.reminderDays || [],
      reminderDay: parsed.reminderDay,
      customInterval: parsed.customInterval,
    },
  });

  const reminderEnabled = watch("reminderEnabled");
  const recurrence = watch("recurrence");
  const reminderTime = watch("reminderTime");
  const reminderDays = watch("reminderDays");
  const reminderDay = watch("reminderDay");
  const customInterval = watch("customInterval");

  // debounce notify to parent to avoid spamming on every keystroke/interaction
  const notifyTimer = useRef<number | null>(null);
  const lastSent = useRef<{ recurrence: string; reminderTime: string | null } | null>(null);

  const scheduleNotify = useCallback(() => {
    if (notifyTimer.current) {
      window.clearTimeout(notifyTimer.current);
      notifyTimer.current = null;
    }
    notifyTimer.current = window.setTimeout(() => {
      const current = { recurrence: serializeRecurrence(getValues()), reminderTime: getValues().reminderTime ?? null };
      // avoid calling onSave if nothing changed
      if (!lastSent.current || lastSent.current.recurrence !== current.recurrence || lastSent.current.reminderTime !== current.reminderTime) {
        lastSent.current = current;
        onSave({ recurrence: current.recurrence, reminderTime: current.reminderTime });
      }
    }, 250);
  }, [getValues, onSave]);

  useEffect(() => {
    // trigger notify when any relevant field changes
    scheduleNotify();

    return () => {
      if (notifyTimer.current) {
        window.clearTimeout(notifyTimer.current);
        notifyTimer.current = null;
      }
    };
  }, [reminderEnabled, recurrence, reminderTime, reminderDays, reminderDay, customInterval, scheduleNotify]);

  // Weekday labels (internal representation)
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // When enabling reminders, ensure a sensible default time is set
  useEffect(() => {
    if (reminderEnabled && (getValues().reminderTime == null || getValues().reminderTime === "")) {
      if (initialTime) setValue("reminderTime", initialTime);
    }
    if (!reminderEnabled) {
      // optionally clear recurrence/time when disabled — keep values but don't notify (serializeRecurrence will return NONE)
      // do nothing here to preserve user inputs while disabled
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderEnabled]);

  // Small helpers for validation/clamping
  const clampMonthDay = (n?: number) => {
    if (!n) return undefined;
    return Math.min(31, Math.max(1, Math.floor(n)));
  };
  const clampCustom = (n?: number) => {
    if (!n) return undefined;
    return Math.max(1, Math.floor(n));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Controller
          name="reminderEnabled"
          control={control}
          render={({ field }) => (
            <Checkbox
              checked={!!field.value}
              onCheckedChange={(val) => {
                const enabled = !!val;
                field.onChange(enabled);
                // If enabling, set sensible defaults
                if (enabled && (getValues().reminderTime == null || getValues().reminderTime === "")) {
                  setValue("reminderTime", initialTime ?? "09:00");
                }
              }}
            />
          )}
        />
        <Label>Enable Reminder</Label>
      </div>

      {reminderEnabled && (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Controller
              name="reminderTime"
              control={control}
              render={({ field }) => (
                <Input
                  type="time"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  aria-label="Reminder time"
                />
              )}
            />

            <Controller
              name="recurrence"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(val) => field.onChange(val as RecurrenceType)} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {recurrence === "WEEKLY" && (
            <div className="flex gap-2 flex-wrap" role="group" aria-label="Select weekdays">
              {weekDays.map((day) => {
                const selected = reminderDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    className={`px-3 py-2 rounded-md border ${
                      selected ? "bg-indigo-500 text-white" : "bg-gray-100"
                    }`}
                    onClick={() =>
                      selected
                        ? setValue("reminderDays", reminderDays.filter((d) => d !== day))
                        : setValue("reminderDays", [...reminderDays, day])
                    }
                    aria-pressed={selected}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          )}

          {recurrence === "MONTHLY" && (
            <Controller
              name="reminderDay"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Day of month"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : clampMonthDay(Number(e.target.value));
                    setValue("reminderDay", val);
                  }}
                  aria-label="Day of month for reminder"
                />
              )}
            />
          )}

          {recurrence === "CUSTOM" && (
            <Controller
              name="customInterval"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min={1}
                  placeholder="Every X days"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : clampCustom(Number(e.target.value));
                    setValue("customInterval", val);
                  }}
                  aria-label="Custom interval in days"
                />
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}