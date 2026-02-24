"use client";

import React, { useState } from "react";
import { Button } from "../../../ui/button";
import { TaskModal } from "./TaskModels";
import type { TaskFormData } from "@/types/task";

export const TaskButton: React.FC<{
  buttonName : string;
}> = ({buttonName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Strongly typed submit handler
  const handleSubmit = async (data: TaskFormData) => {
    
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <Button onClick={() => setIsModalOpen(true)}>{buttonName}</Button>

      <TaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={{
          title: "",
          subtasks: [], // required field
          priority: "MEDIUM", // default to MEDIUM
          recurrence: "NONE",
          pinned: false,
          reminderEnabled: false,
          dueDate: new Date().toISOString().split("T")[0],
          dueTime: "", // optional but included
          type: "PERSONAL", // required field
        }}
      />
    </div>
  );
};
