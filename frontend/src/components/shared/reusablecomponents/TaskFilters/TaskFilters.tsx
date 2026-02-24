"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StatusFilter,
  PriorityFilter,
  PinnedFilter,
  TaskLabel,
} from "@/types/task";
import { Search, Calendar, ChevronDown, X } from "lucide-react";

export type TypeFilter = "all" | "PERSONAL" | "WORK" | "HABIT" | "TEMPLATE" | "OTHER";

interface TaskFiltersProps {
  status: StatusFilter | "all";
  priority: PriorityFilter | "all";
  pinned: PinnedFilter | "all";
  type: TypeFilter | "all";
  searchText: string;
  dateFrom?: string;
  dateTo?: string;
  labels?: TaskLabel[];
  selectedLabelIds?: string[];
  onChangeStatus: (status: StatusFilter | "all") => void;
  onChangePriority: (priority: PriorityFilter | "all") => void;
  onChangePinned: (pinned: PinnedFilter | "all") => void;
  onChangeType: (type: TypeFilter | "all") => void;
  onChangeSearchText: (text: string) => void;
  onChangeDateFrom: (date: string) => void;
  onChangeDateTo: (date: string) => void;
  onChangeLabels?: (ids: string[]) => void;
}

type DropdownOption = { key: string; label: string };

const useDebouncedValue = (value: string, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const Dropdown: React.FC<{
  id: string;
  buttonLabel: string;
  options: DropdownOption[];
  multi?: boolean;
  selected: string | string[];
  onSelect: (val: string) => void;
  onClose?: () => void;
  widthClass?: string;
}> = ({ id, buttonLabel, options, multi = false, selected, onSelect, onClose, widthClass = "w-40" }) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
        onClose?.();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < options.length) {
          onSelect(options[activeIndex].key);
          setOpen(false);
          setActiveIndex(-1);
          onClose?.();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, activeIndex, options, onSelect, onClose]);

  const toggle = () => setOpen((s) => !s);

  const isSelected = (optKey: string) =>
    Array.isArray(selected) ? selected.includes(optKey) : selected === optKey;

  return (
    <div ref={ref} className="relative inline-block text-sm" aria-expanded={open} aria-haspopup="listbox">
      <button
        type="button"
        aria-controls={id}
        aria-haspopup="listbox"
        onClick={toggle}
        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full border flex items-center gap-2 text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <span>{buttonLabel}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div
          id={id}
          role="listbox"
          tabIndex={-1}
          className={`absolute mt-1 bg-white border rounded shadow-lg z-50 ${widthClass} max-h-56 overflow-auto text-sm`}
        >
          {options.map((opt, idx) => (
            <div
              key={opt.key}
              role="option"
              aria-selected={isSelected(opt.key)}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(-1)}
              onClick={() => {
                onSelect(opt.key);
                setOpen(false);
                setActiveIndex(-1);
                onClose?.();
              }}
              className={`px-3 py-2 cursor-pointer flex justify-between items-center ${
                activeIndex === idx ? "bg-gray-100" : ""
              } ${isSelected(opt.key) ? "bg-blue-500 text-white" : ""}`}
            >
              <span>{opt.label}</span>
              {isSelected(opt.key) && <span className="text-xs opacity-80">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  status,
  priority,
  pinned,
  type,
  searchText,
  dateFrom,
  dateTo,
  labels = [],
  selectedLabelIds = [],
  onChangeStatus,
  onChangePriority,
  onChangePinned,
  onChangeType,
  onChangeSearchText,
  onChangeDateFrom,
  onChangeDateTo,
  onChangeLabels,
}) => {
  const priorities: PriorityFilter[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const types: Exclude<TypeFilter, "all">[] = ["PERSONAL", "WORK", "HABIT", "TEMPLATE", "OTHER"];
  const [localSearch, setLocalSearch] = useState(searchText ?? "");
  const debouncedSearch = useDebouncedValue(localSearch, 300);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [openDateDropdown, setOpenDateDropdown] = useState(false);

  useEffect(() => {
    onChangeSearchTextSafe(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    setLocalSearch(searchText ?? "");
  }, [searchText]);

  const onChangeSearchTextSafe = useCallback(
    (text: string) => {
      onChangeSearchText(text);
    },
    [onChangeSearchText]
  );

  const clearFilters = useCallback(() => {
    onChangeStatus("all");
    onChangePriority("all");
    onChangePinned("all");
    onChangeType("all");
    onChangeLabels?.([]);
    onChangeDateFrom("");
    onChangeDateTo("");
    onChangeSearchText("");
  }, [onChangeStatus, onChangePriority, onChangePinned, onChangeType, onChangeLabels, onChangeDateFrom, onChangeDateTo, onChangeSearchText]);

  const toggleLabel = useCallback(
    (id: string) => {
      if (!onChangeLabels) return;
      if (selectedLabelIds.includes(id)) onChangeLabels(selectedLabelIds.filter((x) => x !== id));
      else onChangeLabels([...selectedLabelIds, id]);
    },
    [onChangeLabels, selectedLabelIds]
  );

  // Close date dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDateDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusOptions: DropdownOption[] = useMemo(
    () => [
      { key: "all", label: "All Status" },
      { key: "completed", label: "Completed" },
      { key: "pending", label: "Pending" },
    ],
    []
  );

  const priorityOptions: DropdownOption[] = useMemo(
    () => [{ key: "all", label: "All Priorities" }, ...priorities.map((p) => ({ key: p, label: p }))],
    [priorities]
  );

  const pinnedOptions: DropdownOption[] = useMemo(
    () => [
      { key: "all", label: "All" },
      { key: "pinned", label: "Pinned" },
      { key: "unpinned", label: "Unpinned" },
    ],
    []
  );

  const typeOptions: DropdownOption[] = useMemo(
    () => [{ key: "all", label: "All Types" }, ...types.map((t) => ({ key: t, label: t }))],
    [types]
  );

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-2 text-sm mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[150px] md:min-w-[260px]">
        <Search size={16} className="absolute left-2 top-2 text-gray-400" />
        <input
          aria-label="Search tasks"
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search tasks..."
          className="border rounded px-8 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {localSearch && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setLocalSearch("");
              onChangeSearchText("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Status */}
      <Dropdown
        id="status-filter"
        buttonLabel={`Status: ${status}`}
        options={statusOptions}
        selected={status}
        onSelect={(v) => onChangeStatus(v as StatusFilter | "all")}
      />

      {/* Priority */}
      <Dropdown
        id="priority-filter"
        buttonLabel={`Priority: ${priority}`}
        options={priorityOptions}
        selected={priority}
        onSelect={(v) => onChangePriority(v as PriorityFilter | "all")}
      />

      {/* Pinned */}
      <Dropdown
        id="pinned-filter"
        buttonLabel={`Pinned: ${pinned}`}
        options={pinnedOptions}
        selected={pinned}
        onSelect={(v) => onChangePinned(v as PinnedFilter | "all")}
      />

      {/* Type */}
      <Dropdown
        id="type-filter"
        buttonLabel={`Type: ${type}`}
        options={typeOptions}
        selected={type}
        onSelect={(v) => onChangeType(v as TypeFilter | "all")}
      />

      {/* Date range */}
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setOpenDateDropdown((open) => !open)}
          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full border flex items-center gap-2 text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-haspopup="dialog"
          aria-expanded={openDateDropdown}
        >
          <Calendar size={14} />
          <span>{dateFrom || dateTo ? `${dateFrom ?? "?"} → ${dateTo ?? "?"}` : "Date"}</span>
          <ChevronDown size={12} />
        </button>

        <div
          className={`absolute mt-1 bg-white border rounded shadow-lg z-50 p-3 w-64 max-h-[220px] overflow-auto text-sm ${
            openDateDropdown ? "block" : "hidden"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Date range filter"
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600">Start Date</label>
              <input
                type="date"
                value={dateFrom ?? ""}
                onChange={(e) => onChangeDateFrom(e.target.value)}
                className="border rounded px-2 py-1 text-xs w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600">End Date</label>
              <input
                type="date"
                value={dateTo ?? ""}
                onChange={(e) => onChangeDateTo(e.target.value)}
                className="border rounded px-2 py-1 text-xs w-full"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  onChangeDateFrom("");
                  onChangeDateTo("");
                  setOpenDateDropdown(false);
                }}
                className="flex-1 px-2 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
              >
                Clear
              </button>
              <button
                onClick={() => setOpenDateDropdown(false)}
                className="flex-1 px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("labels-dropdown");
              if (el) el.dataset.open = el.dataset.open === "true" ? "false" : "true";
            }}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full border flex items-center gap-2 text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Labels{selectedLabelIds.length > 0 ? ` (${selectedLabelIds.length})` : ""}
            <ChevronDown size={12} />
          </button>

          <div
            id="labels-dropdown"
            data-open="false"
            className="absolute mt-1 bg-white border rounded shadow-lg z-50 p-2 w-56 flex flex-wrap gap-1 max-h-40 overflow-auto text-xs hidden"
          >
            {labels.map((label) => {
              const id = label.label.id;
              const selected = selectedLabelIds.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleLabel(id)}
                  className={`px-2 py-1 rounded border text-xs ${
                    selected ? "bg-purple-500 text-white border-purple-500" : "bg-white text-gray-700"
                  }`}
                >
                  {label.label.name}
                </button>
              );
            })}
            <div className="w-full flex gap-2 mt-2">
              <button
                onClick={() => onChangeLabels?.([])}
                className="flex-1 px-2 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("labels-dropdown");
                  if (el) el.dataset.open = "false";
                }}
                className="flex-1 px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset / Clear button */}
      <div>
        <button
          type="button"
          onClick={clearFilters}
          className="px-3 py-1 bg-white text-gray-700 rounded-full border flex items-center gap-2 text-sm hover:bg-gray-50 focus:outline-none"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default TaskFilters;
