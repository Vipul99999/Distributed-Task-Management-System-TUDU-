"use client";

import React from "react";
import { useDashboardStore } from "@/stores/useDashboardStore";
import LogoutButton from "@/components/LogoutButton";
import ProfileButton from "@/components/ProfileButton";
import { FiUser, FiShield } from "react-icons/fi";
import Link from "next/link";
export default function Settings() {
  const setSection = useDashboardStore((state) => state.setSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Account Section */}
        <div className="rounded-3xl bg-white p-6 shadow-xl border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Account</h2>

          {/* Profile Preview */}
          <div className="pt-2">
            <ProfileButton />
          </div>
          {/* Profile Navigation */}
          <button
            onClick={() => setSection("profile")}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:bg-indigo-50 hover:shadow-sm"
          >
            <FiUser className="text-indigo-600" />
            <span className="font-medium text-gray-700">Edit Profile</span>
          </button>
        </div>

        {/* Security Section */}
        <div className="rounded-3xl bg-white p-6 shadow-xl border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Security</h2>

          {/* Change Password */}
          <Link
            href="/settings/change-password"
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:bg-indigo-50 hover:shadow-sm"
          >
            <FiShield className="text-indigo-600" />
            <span className="font-medium text-gray-700">Change Password</span>
          </Link>

          <div className="pt-2">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
