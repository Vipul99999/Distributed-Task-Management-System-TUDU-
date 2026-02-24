"use client";

import { useState, useRef, useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useDashboardStore } from "@/stores/useDashboardStore";
import LogoutButton from "../../../LogoutButton";

export default function ProfileDropdown() {
  const user = useUserStore((state) => state.user);
  const setSection = useDashboardStore((state) => state.setSection);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold focus:outline-none hover:ring-2 hover:ring-indigo-400 transition"
      >
        {user.name?.[0] || "U"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 transition-all origin-top-right">
          <div className="p-4 border-b">
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>

          <div className="flex flex-col p-2 space-y-2">
            <button
              className="text-left px-3 py-2 text-gray-700 rounded hover:bg-gray-200 transition"
              onClick={() => {
                setSection("profile"); // ✅ navigate to profile page in main section
                setOpen(false);
              }}
            >
              Profile
            </button>
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
