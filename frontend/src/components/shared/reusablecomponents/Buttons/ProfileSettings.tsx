"use client";

import React from "react";
import { useDashboardStore } from "@/stores/useDashboardStore";
import { useUserStore } from "@/stores/useUserStore";

interface Props {
  onClose?: () => void; // optional callback to close the panel
}

export default function ProfileSettings({ onClose }: Props) {
  const { user } = useUserStore();
  const { setSection } = useDashboardStore(); // ✅ use dashboard store

  if (!user) return <p className="p-4 text-gray-500">No user data available.</p>;

  const handleClose = () => {
    if (onClose) onClose();
    setSection("settings"); // Go back to home section
  };

  return (
    <div className="relative max-w-md w-full mx-auto bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
      {/* Close Button Top-Right */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-lg font-bold"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Profile</h2>
      </div>

      {/* Avatar & Basic Info */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-3xl font-bold mb-2">
          {user.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : "U"}
        </div>
        <p className="text-lg font-semibold">{user.name}</p>
        <p className="text-gray-500 text-sm truncate">{user.email}</p>
        <p className="text-gray-400 text-xs mt-1">{user.role}</p>
      </div>

      {/* Profile Sections */}
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">About</h3>
          <p className="text-gray-500 text-sm">
            This section can include a short bio or additional info about the user.
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Contact Info</h3>
          <p className="text-gray-500 text-sm">Email: {user.email}</p>
          {/* Add phone, LinkedIn, website if available */}
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Role</h3>
          <p className="text-gray-500 text-sm">{user.role}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3">
        <button className="w-full px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition">
          Edit Profile
        </button>
        <button className="w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition">
          Account Settings
        </button>
      </div>
    </div>
  );
}
