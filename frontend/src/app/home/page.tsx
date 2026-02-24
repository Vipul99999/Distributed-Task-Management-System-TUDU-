"use client";
import React, { useState } from "react";

import ViewSelector, {
  ViewOption,
} from "@/components/shared/reusablecomponents/ViewSelector";
import { List, CalendarDays, ActivitySquare } from "lucide-react";

import { TaskList } from "@/components/shared/reusablecomponents/Task/TaskList";
import { CalendarView } from "@/components/shared/reusablecomponents/ViewSelector/CalendarView/CalendarView";
import { TableView as TableView2 } from "@/components/shared/reusablecomponents/ViewSelector/TableView/TableView";

export default function HomePage() {
  const [view, setView] = useState<string>("List");

  const views: ViewOption[] = [
    { name: "List", icon: List },
    { name: "Table", icon: ActivitySquare },
    { name: "Calendar", icon: CalendarDays },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4">
        {/* View Selector */}
        <ViewSelector views={views} defaultView="List" onChange={setView} />

        {/* Render tasks based on selected view */}
        {view === "List" && <TaskList />}
        {view === "Table" && (
          <main className="flex-1 flex flex-col overflow-hidden">
            <TableView2 />
          </main>
        )}
        {/* {view === "Table" && (
          <TableView
            tasks={tasks}
            updateTask={async (data) => {
              await updateTask(data); // returns Task, we ignore it
            }}
            createTask={async (task) => {
              await createTask(task); // returns Task, we ignore it
            }}
            deleteTask={async (id) => {
              await deleteTask(id); // returns boolean, we ignore it
            }}
          />
        )} */}
        {view === "Calendar" && <CalendarView />}
      </div>
    </div>
  );
}
