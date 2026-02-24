"use client";

import React, { useState } from "react";
import { Home, CheckSquare, Target, Calendar, Menu } from "lucide-react";
import SubMobileNav, { subNavMap } from "./SubMobileNav";
import { useDashboardStore } from "@/stores/useDashboardStore";
import MobileMoreSheet from "./MobileMoreSheet";

// types/navigation.ts
export const SECTIONS = [
  "home",
  "tasks",
  "workflows",
  "calendar",
  "settings",
] as const;
export type Section = (typeof SECTIONS)[number];
export type MobileSection = Section; // ✅ now exact match

export default function MobileBottomNav() {
  const { section, taskTab, setSection, setTaskTab } = useDashboardStore();
  const [subNavOpen, setSubNavOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const navItems = [
    { label: "Home", icon: Home, section: "home" },
    { label: "Tasks", icon: CheckSquare, section: "tasks" },
    { label: "Workflows", icon: Target, section: "workflows" },
    { label: "Calendar", icon: Calendar, section: "calendar" },
  ] as const;

  return (
    <div className="pb-14 md:pb-0">
      {/* Sub-navigation for tasks */}
      {subNavOpen && (
        <SubMobileNav
          activeSection={section} // ✅ Pass the current section here
          activeTab={taskTab}
          setActiveTab={(value) =>
            typeof value === "function"
              ? setTaskTab(value(taskTab))
              : setTaskTab(value)
          }
          onClose={() => setSubNavOpen(false)}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-sm flex justify-around items-center h-14 md:hidden pb-[env(safe-area-inset-bottom)]">
        {navItems.map(({ label, icon: Icon, section: navSection }) => (
          <button
            key={navSection}
            aria-label={label}
            aria-current={section === navSection ? "true" : undefined}
            onClick={() => {
              setSection(navSection);

              // Open sub-navigation if section has sub-items
              const hasSubNav = (subNavMap[navSection] || []).length > 0;
              setSubNavOpen(hasSubNav);
            }}
            className={`flex flex-col items-center justify-center flex-1 text-xs ${
              section === navSection ? "text-indigo-600" : "text-gray-600"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}

        <button
          aria-label="More"
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center flex-1 text-xs text-gray-600"
        >
          <Menu size={20} />
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* More Sheet */}

      <MobileMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        setActiveSection={setSection} // ✅ No type errors
      />
    </div>
  );
}
