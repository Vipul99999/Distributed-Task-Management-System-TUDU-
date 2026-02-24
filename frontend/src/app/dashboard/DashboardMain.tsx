"use client";

import React from "react";
import { useDashboardStore } from "@/stores/useDashboardStore";
import HomePage from "../home/page";
import TasksPage, {FilterType} from "../tasks/page";
import Workflows from "../workflows/page";
import Calendar from "../calendar/page";
import Settings from "../settings/page";
import ProfileSettings from "@/components/shared/reusablecomponents/Buttons/ProfileSettings";
import { ImproveDashboard } from "@/components/improvement/ImprovementForm";
 
export default function DashboardMain() {
  const { section, taskTab } = useDashboardStore();

  switch (section) {
    case "home":
      return <HomePage />;
    case "tasks":
  
      return <TasksPage filter={taskTab as FilterType} />;
    case "workflows":
      return <Workflows />;
    case "calendar":
      return <Calendar />;
    case "settings":
      return <Settings />;
    case "improvements":
      return <ImproveDashboard/>;
    case "profile": 
      // ✅ Render ProfileSettings in main content area
      return <ProfileSettings />;
    default:
      return <HomePage />;
  }
}
