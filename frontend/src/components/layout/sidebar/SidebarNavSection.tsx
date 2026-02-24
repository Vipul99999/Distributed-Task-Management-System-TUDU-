"use client";
import React from "react";

type Props = {
  title?: string;
  children: React.ReactNode;
};

export default function SidebarNavSection({ title, children }: Props) {
  return (
    <div>
      {title && <div className="text-xs font-semibold text-gray-500 uppercase mb-1 px-2">{title}</div>}
      <div className="space-y-1">{children}</div>
    </div>
  );
}
