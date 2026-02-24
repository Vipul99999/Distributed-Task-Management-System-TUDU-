"use client";
import { useMobileNavStore } from "@/stores/useMobileNavStore";
import SidebarNavItem from "@/components/layout/sidebar/SidebarNavItem";
import SidebarSettings from "@/components/layout/sidebar/settings/Settings";
import { Inbox, Zap, Calendar } from "lucide-react";

export default function MobileSidebarOverlay() {
  const { activeSection, setActiveSection } = useMobileNavStore();
  const show =
    activeSection !== null &&
    typeof window !== "undefined" &&
    window.innerWidth < 768;

  // Optional: focus trap for accessibility

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform ${
        show ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col p-2 space-y-2">
        {activeSection === "tasks" && (
          <>
            <SidebarNavItem
              icon={Inbox}
              label="Today"
              onClick={() => console.log("today")}
            />
            <SidebarNavItem
              icon={Inbox}
              label="Upcoming"
              onClick={() => console.log("upcoming")}
            />
          </>
        )}
        {activeSection === "workflows" && (
          <SidebarNavItem icon={Zap} label="Workflows" />
        )}
        {activeSection === "calendar" && (
          <SidebarNavItem icon={Calendar} label="Calendar" />
        )}
        {activeSection === "settings" && (
          <SidebarSettings collapsed={false}  />
        )}
      </div>

      <button
        className="absolute top-2 right-2 text-gray-500"
        onClick={() => setActiveSection("close")}
      >
        ✕
      </button>
    </div>
  );
}
