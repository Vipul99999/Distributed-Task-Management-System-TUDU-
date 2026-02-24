import React from "react";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { TaskFormData } from "@/validation/validateSchema";

interface PrioritySelectProps {
  value: TaskFormData["priority"];
  onChange: (val: TaskFormData["priority"]) => void;
}

export const PrioritySelect: React.FC<PrioritySelectProps> = ({ value, onChange }) => (
  <Select onValueChange={onChange} value={value}>
    <SelectTrigger aria-label="Priority">
      <SelectValue placeholder="Priority" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="LOW">🟢 Low</SelectItem>
      <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
      <SelectItem value="HIGH">🔴 High</SelectItem>
      <SelectItem value="URGENT">🔥 Urgent</SelectItem>
    </SelectContent>
  </Select>
);
