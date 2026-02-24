"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useSidebarStore } from "@/stores/useSidebarStore";

export default function ResponsiveSearch() {
  const { searchQuery, setSearchQuery } = useSidebarStore();
  const [active, setActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-focus input when active
  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleClose = () => {
    setActive(false);
    setSearchQuery("");
  };

  return (
    <div className="relative w-full max-w-xs sm:max-w-full">
      <div
        className={`
          flex items-center transition-all duration-300 ease-in-out
          ${
            active
              ? "w-full bg-white rounded-md shadow-md px-2"
              : "w-10 cursor-pointer sm:w-full sm:bg-transparent sm:shadow-none sm:px-0"
          }
        `}
        onClick={() => !active && setActive(true)}
      >
        <Search className="w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className={`
            ml-2 w-full text-sm sm:text-base outline-none
            ${active || !isMobile ? "block" : "hidden sm:block"}
            transition-all duration-300
          `}
        />
        {active && searchQuery && (
          <button
            onClick={handleClear}
            className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {active && isMobile && (
          <button
            onClick={handleClose}
            className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none text-sm font-medium"
            aria-label="Close search"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
