import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  contextPanelOpen: boolean;

  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  setCommandPalette: (open: boolean) => void;
  toggleContextPanel: () => void;
  setContextPanel: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  contextPanelOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setCommandPalette: (open) => set({ commandPaletteOpen: open }),
  toggleContextPanel: () => set((state) => ({ contextPanelOpen: !state.contextPanelOpen })),
  setContextPanel: (open) => set({ contextPanelOpen: open }),
}));
