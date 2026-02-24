"use client";
import { useState, useRef, useEffect } from "react";
import { TaskButton } from "@/components/shared/reusablecomponents/taskModels/TaskButton";
import ResponsiveSearch from "@/components/shared/reusablecomponents/ResponsiveSearch";
import ProfileDropdown from "@/components/shared/reusablecomponents/Buttons/Profile";
export default function TopBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full flex items-center justify-between px-4 h-14 bg-white shadow-sm border-b">
      {/* Left: placeholder for mobile sidebar */}
      <div className="flex items-center"></div>

      {/* Center */}
      <div className="flex-1 flex justify-center sm:justify-start px-2">
        <ResponsiveSearch />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 relative">
        <TaskButton buttonName="Add Task" />

        <ProfileDropdown />
      </div>
    </header>
  );
}
