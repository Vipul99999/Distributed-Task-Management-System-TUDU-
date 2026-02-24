"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";

export type ViewOption = {
  name: string;
  icon: LucideIcon;
};

interface ViewSelectorProps {
  views: ViewOption[];
  defaultView?: string;
  onChange?: (view: string) => void;
}

export default function ViewSelector({
  views,
  defaultView,
  onChange,
}: ViewSelectorProps) {
  const [active, setActive] = useState<string>(defaultView || views[0]?.name);

  const handleSelect = (view: string) => {
    setActive(view);
    if (onChange) onChange(view);
  };

  return (
    <div className="w-full ">
      <div className="bg-white px-3 pt-1 pb-1  shadow-sm border border-gray-200">

        <div className="flex gap-2 overflow-x-auto pb-1 sm:overflow-visible sm:flex-wrap scrollbar-hide">
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = active === view.name;

            return (
              <button
                key={view.name}
                onClick={() => handleSelect(view.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-all whitespace-nowrap flex-shrink-0
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 border-indigo-500"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <Icon size={16} />
                <span>{view.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
