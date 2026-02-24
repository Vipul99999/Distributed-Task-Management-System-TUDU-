import { create } from "zustand";
import { MobileSection } from "@/types/navigation";

interface MobileNavState {
  activeSection: MobileSection;
  setActiveSection: (section: MobileSection) => void;
  activeTab: string; // current subtab
  setActiveTab: (tab: string) => void;
  isMoreOpen: boolean;
  setMoreOpen: (open: boolean) => void;
}

export const useMobileNavStore = create<MobileNavState>((set) => ({
  activeSection: "home",
  setActiveSection: (section) => set({ activeSection: section }),
  activeTab: "", 
  setActiveTab: (tab) => set({ activeTab: tab }),
  isMoreOpen: false,
  setMoreOpen: (open) => set({ isMoreOpen: open }),
}));
