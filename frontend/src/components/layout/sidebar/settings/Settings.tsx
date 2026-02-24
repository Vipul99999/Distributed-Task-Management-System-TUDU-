"use client";

import React from "react";
import { Settings as SettingsIcon } from "lucide-react";
import clsx from "clsx";
import { useDashboardStore } from "@/stores/useDashboardStore";

interface Props {
  collapsed: boolean;
}

export default function SidebarSettings({ collapsed }: Props) {
  const setSection = useDashboardStore((s) => s.setSection);

  return (
    <div className="px-2 py-3 border-t mt-auto">
      <button
        onClick={() => setSection("settings")}
        className={clsx(
          "flex items-center w-full text-sm rounded-md hover:bg-gray-100 focus:outline-none",
          collapsed ? "justify-center px-2 py-2" : "justify-start gap-6 px-3 py-2"
        )}
        title={collapsed ? "Settings" : undefined}
      >
        <SettingsIcon size={18} />
        {!collapsed && <span>Settings</span>}
      </button>
    </div>
  );
}
