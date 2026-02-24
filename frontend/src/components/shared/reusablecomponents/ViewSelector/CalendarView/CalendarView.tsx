"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  subMonths,
  addMonths,
  parseISO,
  isSameDay,
  isToday,
  differenceInCalendarWeeks,
  getYear,
  getMonth,
} from "date-fns";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import {
  Task,
  TaskFormData,
  StatusFilter,
  PriorityFilter,
  PinnedFilter,
  TypeFilter,
} from "@/types/task";

import { useTasks } from "@/hooks/useTasks";
import { TaskModal } from "../../taskModels/TaskModels";
import { CalendarDay } from "./CalendarDay";
import { TaskFilters } from "@/components/shared/reusablecomponents/TaskFilters/TaskFilters";
import { TaskLabel } from "@/types/task";
interface Props {
  availableLabels?: TaskLabel[];
  filter?: {dateFrom?: string; dateTo?: string}; // optional date range filter
}
export const CalendarView: React.FC<Props> = ({ availableLabels = [] ,filter}) => {
  const { tasks, isLoading, isError, updateTask, createTask } = useTasks();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [modalTask, setModalTask] = useState<Task | null>(null);
  // internal filters for Calendar
  const [filters, setFilters] = useState({
    status: "all" as StatusFilter,
    priority: "all" as PriorityFilter,
    pinned: "all" as PinnedFilter,
    type: "all" as TypeFilter,
    searchText: "",
    dateFrom: filter?.dateFrom,
    dateTo: filter?.dateTo,
  });
// ⏱ keep local filters in sync when parent filter changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      dateFrom: filter?.dateFrom,
      dateTo: filter?.dateTo,
    }));
  }, [filter]);
  
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Dismiss dropdowns on clicking outside
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthRef.current && !monthRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false);
      }
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setShowYearDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calendarDays = useMemo(() => {
    if (viewMode === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      const days: Date[] = [];
      let day = start;
      while (day <= end) {
        days.push(day);
        day = addDays(day, 1);
      }
      return days;
    }
    const startMonth = startOfMonth(currentDate);
    const endMonth = endOfMonth(currentDate);
    const startDate = startOfWeek(startMonth);
    const endDate = endOfWeek(endMonth);
    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate, viewMode]);

  const weekNumber = (date: Date) =>
    differenceInCalendarWeeks(date, new Date(1970, 0, 4), { weekStartsOn: 1 }) + 1;

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filters.status === "completed" && !t.isCompleted) return false;
        if (filters.status === "pending" && t.isCompleted) return false;
        if (filters.priority !== "all" && t.priority !== filters.priority) return false;
        if (filters.pinned === "pinned" && !t.pinned) return false;
        if (filters.pinned === "unpinned" && t.pinned) return false;
        if (filters.type !== "all" && t.type !== filters.type) return false;
        if (
          filters.searchText &&
          !t.title.toLowerCase().includes(filters.searchText.toLowerCase())
        )
          return false;
        if (filters.dateFrom && t.dueDate && t.dueDate < filters.dateFrom) return false;
        if (filters.dateTo && t.dueDate && t.dueDate > filters.dateTo) return false;
        return true;
      })
      .sort((a, b) => {
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
      });
  }, [tasks, filters]);

  const tasksByDay = useCallback(
    (day: Date) =>
      filteredTasks
        .filter((t) => t.dueDate && isSameDay(parseISO(t.dueDate), day))
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
    [filteredTasks]
  );

  const prev = () => {
    setCurrentDate(viewMode === "month" ? subMonths(currentDate, 1) : addDays(currentDate, -7));
  };

  const next = () => {
    setCurrentDate(viewMode === "month" ? addMonths(currentDate, 1) : addDays(currentDate, 7));
  };

  const goToday = () => setCurrentDate(new Date());

  const onSelectMonth = (monthIndex: number) => {
    setCurrentDate(new Date(getYear(currentDate), monthIndex, 1));
    setShowMonthDropdown(false);
  };

  const onSelectYear = (year: number) => {
    setCurrentDate(new Date(year, getMonth(currentDate), 1));
    setShowYearDropdown(false);
  };

  const openModal = useCallback((task?: Partial<Task>) => {
    if (task && "id" in task) setModalTask(task as Task);
    else
      setModalTask({
        id: uuidv4(),
        title: "",
        isCompleted: false,
        priority: "LOW",
        pinned: false,
        dueDate: new Date().toISOString(),
        orderIndex: 0,
        type: "PERSONAL",
        recurrence: "NONE",
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
  }, []);

  const closeModal = useCallback(() => setModalTask(null), []);

  const saveTask = useCallback(
    async (data: TaskFormData) => {
      if (!modalTask) return;
      const taskData: Partial<Task> = { ...modalTask, ...data };
      const existing = tasks.find((t) => t.id === modalTask.id);
      if (existing) await updateTask({ id: modalTask.id, updates: taskData });
      else await createTask(taskData as Task);
      closeModal();
    },
    [modalTask, tasks, updateTask, createTask, closeModal]
  );

  // Generate years for picker dropdown
  const yearOptions = useMemo(() => {
    const currentYear = getYear(new Date());
    return Array.from({ length: 40 }, (_, i) => currentYear - 20 + i);
  }, []);

  // Week day rendering for headers
  const renderCalendarWeekDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <>
        {viewMode === "week" && (
          <div className="font-medium text-gray-600 px-2 py-1 border-r select-none text-center">Wk</div>
        )}
        {days.map((d) => (
          <div
            key={d}
            className="font-medium text-gray-600 px-2 py-1 select-none text-center border-t border-b"
            role="columnheader"
          >
            {d}
          </div>
        ))}
      </>
    );
  };

  if (isLoading) return <p className="text-center py-4">Loading tasks...</p>;
  if (isError) return <p className="text-center text-red-600 py-4">Error loading tasks!</p>;

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      {/* Header with month/year pickers */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-2 flex-wrap">

          <Button variant="outline" size="sm" onClick={goToday} aria-label="Go to today">
            Today
          </Button>

          {/* Month picker */}
          <div className="relative" ref={monthRef}>
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="flex items-center px-3 py-1 border rounded cursor-pointer select-none"
              aria-haspopup="listbox"
              aria-expanded={showMonthDropdown}
            >
              {format(currentDate, "MMMM")}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showMonthDropdown && (
              <ul
                role="listbox"
                tabIndex={-1}
                className="absolute mt-1 max-h-48 w-32 overflow-auto rounded bg-white border shadow-md z-30"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <li
                    key={i}
                    role="option"
                    tabIndex={0}
                    className={`cursor-pointer px-3 py-1  hover:bg-blue-100 ${
                      i === currentDate.getMonth() ? "font-semibold text-blue-700" : ""
                    }`}
                    onClick={() => onSelectMonth(i)}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && onSelectMonth(i)}
                  >
                    {format(new Date(0, i), "MMMM")}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Year picker */}
          <div className="relative" ref={yearRef}>
            <button
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="flex items-center px-3 py-1 border rounded cursor-pointer select-none"
              aria-haspopup="listbox"
              aria-expanded={showYearDropdown}
            >
              {format(currentDate, "yyyy")}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showYearDropdown && (
              <ul
                role="listbox"
                tabIndex={-1}
                className="absolute mt-1 max-h-48 w-24 overflow-auto rounded bg-white border shadow-md z-30"
              >
                {yearOptions.map(year => (
                  <li
                    key={year}
                    role="option"
                    tabIndex={0}
                    className={`cursor-pointer px-3 py-1 hover:bg-blue-100 ${
                      year === getYear(currentDate) ? "font-semibold text-blue-700" : ""
                    }`}
                    onClick={() => onSelectYear(year)}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && onSelectYear(year)}
                  >
                    {year}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* View mode toggle */}
          <Button
            size="sm"
            variant={viewMode === "month" ? "default" : "outline"}
            onClick={() => setViewMode("month")}
            aria-label="Month view"
          >
            Month
          </Button>
          <Button
            size="sm"
            variant={viewMode === "week" ? "default" : "outline"}
            onClick={() => setViewMode("week")}
            aria-label="Week view"
          >
            Week
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={prev} aria-label="Previous period">
            <ChevronLeft size={16} />
          </Button>
          <Button size="sm" onClick={next} aria-label="Next period">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters
        status={filters.status}
        priority={filters.priority}
        pinned={filters.pinned}
        type={filters.type}
        searchText={filters.searchText}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onChangeStatus={s => setFilters(f => ({ ...f, status: s }))}
        onChangePriority={p => setFilters(f => ({ ...f, priority: p }))}
        onChangePinned={p => setFilters(f => ({ ...f, pinned: p }))}
        onChangeType={t => setFilters(f => ({ ...f, type: t }))}
        onChangeSearchText={t => setFilters(f => ({ ...f, searchText: t }))}
        onChangeDateFrom={d => setFilters(f => ({ ...f, dateFrom: d }))}
        onChangeDateTo={d => setFilters(f => ({ ...f, dateTo: d }))}
      />

      {/* Calendar Grid */}
      <div
        className={`overflow-auto rounded border border-gray-300 mt-4 ${
          viewMode === "week" ? "grid grid-cols-8" : "grid grid-cols-7"
        }`}
        role="grid"
        aria-label="Calendar dates"
        style={{ minWidth: "320px" }} // allow horizontal scroll on small devices
      >
        {renderCalendarWeekDays()}

        {viewMode === "week" &&
          (() => {
            const start = startOfWeek(currentDate);
            const wnum = weekNumber(start);
            return (
              <div className="border-r border-t border-b text-center px-2 py-1 select-none font-medium text-gray-500">
                {wnum}
              </div>
            );
          })()}

        {calendarDays.map(day => {
          const dayTasks = tasksByDay(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const highlightToday = isToday(day);

          return (
            <CalendarDay
              key={day.toISOString()}
              day={day}
              tasks={dayTasks}
              onTaskClick={openModal}
              onReorder={async newTasks => {
                for (let i = 0; i < newTasks.length; i++) {
                  await updateTask({ id: newTasks[i].id, updates: { orderIndex: i } });
                }
              }}
              onMove={async (task, targetListId) => {
                await updateTask({ id: task.id, updates: { dueDate: targetListId } });
              }}
              className={`border-r border-b p-2 flex flex-col ${
                isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
              } ${highlightToday ? "border-blue-500 shadow-lg relative" : ""}`}
            />
          );
        })}
      </div>

      {/* Task Modal */}
      {modalTask && (
        <TaskModal
          open={!!modalTask}
          initialData={modalTask}
          onClose={closeModal}
          onSubmit={saveTask}
        />
      )}

      {!isLoading && tasks.length === 0 && (
        <p className="text-center text-gray-500 mt-10 text-lg">No tasks to show. Add new tasks!</p>
      )}
    </div>
  );

  function renderWeekDays() {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <>
        {viewMode === "week" && (
          <div className="font-medium text-gray-600 px-2 py-1 border-r select-none text-center">Wk</div>
        )}
        {days.map(d => (
          <div
            key={d}
            className="font-medium text-gray-600 px-2 py-1 select-none text-center border-t border-b"
            role="columnheader"
          >
            {d}
          </div>
        ))}
      </>
    );
  }
};
