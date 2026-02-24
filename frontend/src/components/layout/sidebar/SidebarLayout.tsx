"use client";

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import clsx from "clsx";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useDashboardStore } from "@/stores/useDashboardStore";
import {
  Home,
  Briefcase,
  List,
  Calendar,
  Zap,
  Clock,
  RefreshCw,
} from "lucide-react";
import SidebarNavSection from "./SidebarNavSection";
import SidebarNavItem from "./SidebarNavItem";
import SidebarToggle from "./SidebarToggle";
import SidebarSettings from "./settings/Settings";

const MIN_WIDTH = 60;
const MAX_WIDTH = 420;
const MIN_RESIZE = 120;
const AUTO_COLLAPSE_BREAKPOINT = 640;

function clamp(x: number) {
  return Math.max(MIN_RESIZE, Math.min(MAX_WIDTH, x));
}

export default function SidebarLayout() {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const resizing = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const width = useSidebarStore((s) => s.width);
  const setWidth = useSidebarStore((s) => s.setWidth);
  const collapsed = useSidebarStore((s) => s.collapsed);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);

  const { section, taskTab, setSection, setTaskTab } = useDashboardStore();

  // Resize handling
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!resizing.current) return;
      e.preventDefault();
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newW = clamp(e.clientX - left);
      setWidth(newW);
    };
    const stop = () => {
      resizing.current = false;
      setIsDragging(false);
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [setWidth]);

  useLayoutEffect(() => {
    document.body.style.userSelect = isDragging ? "none" : "";
    document.body.style.touchAction = isDragging ? "none" : "";
    return () => {
      document.body.style.userSelect = "";
      document.body.style.touchAction = "";
    };
  }, [isDragging]);

  useEffect(() => {
    const onResize = () => {
      setCollapsed(window.innerWidth < AUTO_COLLAPSE_BREAKPOINT);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setCollapsed]);

  const startPointer = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    resizing.current = true;
    setIsDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handleResetWidth = () => {
    useSidebarStore.getState().resetWidthToDefault();
    setCollapsed(false);
  };

  const navigateToTasks = (tab: "today" | "upcoming" | "completed" | "overdue") => {
    setSection("tasks");
    setTaskTab(tab);
  };

  return (
    <aside
      ref={sidebarRef}
      className={clsx(
        "bg-white border-r h-screen flex flex-col relative transition-[width] duration-100 ease-linear",
        isDragging && "cursor-ew-resize"
      )}
      style={{ width: collapsed ? MIN_WIDTH : width }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b">
        <div className="flex items-center gap-2">
          <SidebarToggle />
          {!collapsed && <div className="text-sm font-semibold">Tudu</div>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-3">
        <SidebarNavSection>
          <SidebarNavItem
            icon={Home}
            label="Home"
            active={section === "home"}
            onClick={() => setSection("home")}
          />
        </SidebarNavSection>

        <SidebarNavSection title="Tasks">
          <SidebarNavItem
            icon={Clock}
            label="Today"
            active={taskTab === "today"}
            onClick={() => navigateToTasks("today")}
          />
          <SidebarNavItem
            icon={Calendar}
            label="Upcoming"
            active={taskTab === "upcoming"}
            onClick={() => navigateToTasks("upcoming")}
          />
          <SidebarNavItem
            icon={List}
            label="Completed"
            active={taskTab === "completed"}
            onClick={() => navigateToTasks("completed")}
          />
          <SidebarNavItem
            icon={Zap}
            label="Overdue"
            active={taskTab === "overdue"}
            onClick={() => navigateToTasks("overdue")}
          />
        </SidebarNavSection>

        <SidebarNavSection title="Workflows">
          <SidebarNavItem
            icon={Briefcase}
            label="improve"
            active={section === "improvements"}
            onClick={() => setSection("improvements")}
          />
          
        </SidebarNavSection>
      </div>

      <SidebarSettings collapsed={collapsed}  />

      {!collapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          tabIndex={0}
          onPointerDown={startPointer}
          onDoubleClick={handleResetWidth}
          className="absolute top-0 right-0 w-2 h-full cursor-ew-resize bg-transparent hover:bg-gray-200 z-50"
        >
          <div className="absolute -right-2 top-0 h-full w-4" aria-hidden />
        </div>
      )}
    </aside>
  );
}
