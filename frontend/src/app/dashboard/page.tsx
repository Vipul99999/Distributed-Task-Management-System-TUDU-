"use client";

import React from "react";
import SidebarLayout from "@/components/layout/sidebar/SidebarLayout";
import TopBar from "@/components/layout/topbar/TopBar";
import MobileBottomNav from "@/components/layout/mobileview/MobileBottomNav";
import DashboardMain from "./DashboardMain";

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      {/* Desktop / tablet sidebar */}
      <div className="hidden md:block">
        <SidebarLayout />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto bg-gray-50">
          <DashboardMain />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
