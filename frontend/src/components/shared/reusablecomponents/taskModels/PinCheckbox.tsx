"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PinCheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

export const PinCheckbox: React.FC<PinCheckboxProps> = ({ value, onChange, label = "Pin this task" }) => {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={value} onCheckedChange={(v) => onChange(!!v)} />
      <Label>{label}</Label>
    </div>
  );
};
