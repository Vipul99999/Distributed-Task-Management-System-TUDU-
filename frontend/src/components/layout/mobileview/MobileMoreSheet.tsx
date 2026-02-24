"use client";

import React, { useEffect, useRef } from "react";
import { Settings, BarChart2, Box, RefreshCw, FileText } from "lucide-react";
import useLockBodyScroll from "@/components/utils/useLockBodyScroll";
import { MobileSection } from "@/types/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
  setActiveSection: (section: MobileSection) => void; // callback to update main section
}

const moreItems: { label: string; icon: React.ComponentType<{ size?: number }>; section: MobileSection }[] = [
  { label: "Settings", icon: Settings, section: "settings" },
  // { label: "Analytics", icon: BarChart2, section: "analytics" },
  // { label: "Features", icon: Box, section: "features" },
  { label: "Improvements", icon: RefreshCw, section: "improvements" },
  // { label: "Content", icon: FileText, section: "content" },
];

export default function MobileMoreSheet({ open, onClose, setActiveSection }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLockBodyScroll(open);

  // Focus first button and handle Escape key
  useEffect(() => {
    if (!open) return;

    const firstBtn = rootRef.current?.querySelector<HTMLElement>("button");
    firstBtn?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Close when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (!rootRef.current?.contains(e.target as Node)) onClose();
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity pointer-events-auto`}
        aria-hidden
        onClick={onClose}
      />

      {/* Sheet */}
      <div
  ref={rootRef}
  role="dialog"
  aria-modal="true"
  className={`absolute bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-xl transform transition-all pointer-events-auto ${
    open ? "translate-y-0" : "translate-y-full"
  }`}
>

        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="text-base font-semibold">More</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <div className="p-4 grid grid-cols-3 gap-3">
          {moreItems.map((item) => (
            <button
              key={item.section}
              onClick={() => {
                console.log("navigate to", item.section);
                setActiveSection(item.section); // navigate to section
                onClose();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <item.icon size={22} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
