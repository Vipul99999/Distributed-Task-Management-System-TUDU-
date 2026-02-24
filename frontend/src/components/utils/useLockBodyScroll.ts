"use client";
import { useEffect } from "react";

export default function useLockBodyScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [enabled]);
}
