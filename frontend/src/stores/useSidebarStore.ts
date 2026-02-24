// use client
"use client";

import { create } from "zustand";

const STORAGE_KEY = "sidebar-ui-v1";


export type SidebarState = {
  collapsed: boolean;
  width: number;       
  savedWidth: number;
  searchQuery : string;  // last user width (persisted)
  setWidth: (w: number) => void;
  toggleCollapse: () => void;
  setCollapsed: (c: boolean) => void;
  resetWidthToDefault: () => void;
  setSearchQuery: (q: string) => void;
  activeMobileSection: string;
  setActiveMobileSection: (section: string) => void;

};

const DEFAULT_WIDTH = 200;
const MIN_WIDTH = 60;
const MAX_WIDTH = 420;

function readInitialState() {
  if (typeof window === "undefined") {
    return { collapsed: false, width: DEFAULT_WIDTH, savedWidth: DEFAULT_WIDTH ,searchQuery: ""};
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { collapsed: false, width: DEFAULT_WIDTH, savedWidth: DEFAULT_WIDTH,searchQuery: "" };
    const parsed = JSON.parse(raw);
    return {
      collapsed: parsed.collapsed ?? false,
      // prefer savedWidth if present
      width: parsed.savedWidth ?? parsed.width ?? DEFAULT_WIDTH,
      savedWidth: parsed.savedWidth ?? parsed.width ?? DEFAULT_WIDTH,
     searchQuery: parsed.searchQuery ?? "",


    };
  } catch {
    return { collapsed: false, width: DEFAULT_WIDTH, savedWidth: DEFAULT_WIDTH };
  }
}

function persistState(partial: Partial<{ collapsed: boolean; savedWidth: number;searchQuery: string }>) {
  try {
    const prevRaw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const prev = prevRaw ? JSON.parse(prevRaw) : {};
    const next = { ...prev, ...partial };
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
    return {
      collapsed: false,
      width: DEFAULT_WIDTH,
      savedWidth: DEFAULT_WIDTH,
      searchQuery: "",
    };

  }
}

const initial = readInitialState();

export const useSidebarStore = create<SidebarState>((set, get) => ({
  collapsed: initial.collapsed,
  width: initial.width,
  savedWidth: initial.savedWidth,
  searchQuery: initial.searchQuery,
  activeMobileSection: "",

 setActiveMobileSection: (section: string) =>
    set({ activeMobileSection: section }),
  setWidth: (w: number) => {
    const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.round(w)));
    // update width and savedWidth (persist savedWidth)
    set({ width: clamped, savedWidth: clamped });
    persistState({ savedWidth: clamped });
  },

  toggleCollapse: () => {
    const s = get();
    if (s.collapsed) {
      // expanding -> open at DEFAULT_WIDTH (per your request)
      set({ collapsed: false, width: DEFAULT_WIDTH });
    } else {
      set({ collapsed: true });
    }
    persistState({ collapsed: !s.collapsed });
  },

  setCollapsed: (c: boolean) => {
    if (c === false) {
      set({ collapsed: false, width: DEFAULT_WIDTH });
      persistState({ collapsed: false });
    } else {
      set({ collapsed: true });
      persistState({ collapsed: true });
    }
  },

  resetWidthToDefault: () => {
    set({ width: DEFAULT_WIDTH, savedWidth: DEFAULT_WIDTH });
    persistState({ savedWidth: DEFAULT_WIDTH });
  },
   setSearchQuery: (q: string) => {
    set({ searchQuery: q });
    persistState({ searchQuery: q });
  },

}));
