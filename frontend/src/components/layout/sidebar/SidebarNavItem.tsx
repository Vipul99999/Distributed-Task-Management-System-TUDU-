"use client";
import React from "react";
import clsx from "clsx";
import * as Icons from "lucide-react";
import { useSidebarStore } from "@/stores/useSidebarStore";

interface SidebarNavItemProps {
  icon?: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number | null;
}

export default function SidebarNavItem({
  icon: Icon = Icons.Circle,
  label,
  active = false,
  onClick,
  badge = null,
}: SidebarNavItemProps) {
  const { collapsed } = useSidebarStore();

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex items-center w-full px-2 py-2 text-sm rounded-md transition-colors",
        active
          ? "bg-blue-100 text-blue-600 font-medium"
          : "text-gray-700 hover:bg-gray-100",
        collapsed ? "justify-center" : "text-left gap-2"
      )}
      title={collapsed ? label : undefined} // tooltip on hover when collapsed
    >
      <Icon size={18} />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && badge && <span className="ml-auto">{badge}</span>}
    </button>
  );
}
