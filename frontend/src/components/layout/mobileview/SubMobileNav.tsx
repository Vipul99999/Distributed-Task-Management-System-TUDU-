"use client";

import React from "react";
import { MobileSection } from "@/types/navigation";
import { X } from "lucide-react";

interface SubNavItem<T extends string = string> {
  label: string;
  section: MobileSection;
  tab?: T;
}

interface Props<T extends string = string> {
  activeSection: MobileSection;
  activeTab: T;
  setActiveTab: React.Dispatch<React.SetStateAction<T>>;
  onClose: () => void;
}

// Map of sub-navigation items for each section
export const subNavMap: Record<MobileSection, SubNavItem<string>[]> = {
  home: [],
  tasks: [
    { label: "Today", section: "tasks", tab: "today" },
    { label: "Upcoming", section: "tasks", tab: "upcoming" },
    { label: "Completed", section: "tasks", tab: "completed" },
    { label: "Overdue", section: "tasks", tab: "overdue" },
  ],
  workflows: [{ label: "Improvement", section: "workflows", tab: "improvement" }],
  calendar: [],
  settings: [],
  improvements: [],
  help: [],
  about: [],
  profile: [],
  close: [],
};


export default function SubMobileNav<T extends string>({
  activeSection,
  activeTab,
  setActiveTab,
  onClose,
}: Props<T>) {
  const items = (subNavMap[activeSection] || []) as SubNavItem<T>[];
  if (items.length === 0) return null;

  return (
    <div
      id="sub-mobile-nav"
      className="
        fixed bottom-14 left-0 right-0 z-50
        flex items-center bg-white shadow-inner border-t border-gray-200 py-1 px-2
        overflow-x-auto scrollbar-hide scroll-smooth
        lg:hidden
      "
    >
      <div className="flex items-center space-x-2 flex-1">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => item.tab && setActiveTab(item.tab)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition
              ${activeTab === item.tab ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"}
              hover:bg-indigo-100
            `}
          >
            {item.label}
          </button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="ml-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex-shrink-0 p-2"
      >
        <X size={24} />
      </button>
    </div>
  );
}
