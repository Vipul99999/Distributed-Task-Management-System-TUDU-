"use client";

import { useEffect, useState, useRef } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useRouter } from "next/navigation";
import { FiUser, FiSettings } from "react-icons/fi";

export default function ProfileButton() {
  const { user, fetchUser } = useUserStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch user on mount if not available
  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  // Close dropdown on outside click
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

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-2 shadow-md backdrop-blur-md transition-all hover:shadow-lg"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white">
          {initials}
        </div>
        <span className="hidden text-sm font-medium text-gray-700 md:block">
          {user.name}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-gray-100 bg-white/80 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          {/* User Info */}
          <div className="mb-3 border-b pb-3">
            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500"><FiUser/> <span>{user.email}</span></p>
            <span className="mt-2 inline-block rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-600">
              {user.role}
            </span>
          </div>

          {/* Menu Items */}
          <div className="space-y-1 text-sm">

            <button
              onClick={() => router.push("/settings")}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-indigo-50"
            >
              <FiSettings /> Settings
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
