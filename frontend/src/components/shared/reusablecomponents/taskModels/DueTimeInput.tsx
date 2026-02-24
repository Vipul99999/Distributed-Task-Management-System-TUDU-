"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface DueTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  formatTime?: (time24: string) => string;
}

export const DueTimeInput: React.FC<DueTimeInputProps> = ({ value, onChange, error, formatTime }) => {
  return (
    <div>
      <label className="sr-only">Due time</label>
      <Input type="time" value={value} onChange={(e) => onChange(e.target.value)} />
      {value && formatTime && <p className="text-sm">{formatTime(value)}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
