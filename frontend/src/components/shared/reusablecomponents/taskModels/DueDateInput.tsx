"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface DueDateInputProps {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  error?: string;
}

export const DueDateInput: React.FC<DueDateInputProps> = ({ value, onChange, minDate, error }) => {
  return (
    <div>
      <label className="sr-only">Due date</label>
      <Input
        type="date"
        value={value}
        min={minDate}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
