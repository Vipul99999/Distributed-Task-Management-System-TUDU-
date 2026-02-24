"use client";
import React from "react";
import { useSidebarStore } from "@/stores/useSidebarStore";
import clsx from "clsx";

export default function SidebarToggle(): React.JSX.Element {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggle = useSidebarStore((s) => s.toggleCollapse);

  return (
    <button
      onClick={toggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand" : "Collapse"}
      className={clsx(
        "flex items-center justify-center w-9 h-9 rounded focus:outline-none focus:ring",
        "hover:bg-gray-100"
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={collapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
