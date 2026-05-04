"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Monitor, Settings as SettingsIcon, LogOut, ArrowRight, Activity, Focus } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Fuse from "fuse.js";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface Action {
  id: string;
  title: string;
  icon: React.ElementType;
  type: string;
  action: (r: ReturnType<typeof useRouter>) => void;
}

const ACTIONS: Action[] = [
  { id: "dashboard", title: "Go to Dashboard", icon: Monitor, type: "Navigation", action: (r) => r.push("/dashboard") },
  { id: "focus", title: "Start Focus Session", icon: Focus, type: "Action", action: (r) => r.push("/focus") },
  { id: "heatmap", title: "View Heatmap", icon: Activity, type: "Navigation", action: (r) => r.push("/heatmap") },
  { id: "settings", title: "Open Settings", icon: SettingsIcon, type: "Navigation", action: (r) => r.push("/settings") },
  { id: "logout", title: "Log Out", icon: LogOut, type: "Action", action: () => signOut({ callbackUrl: "/login" }) },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPalette } = useUIStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const fuse = new Fuse(ACTIONS, { keys: ["title", "type"], threshold: 0.3 });
  const results = query ? fuse.search(query).map((res) => res.item) : ACTIONS;

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [commandPaletteOpen]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((p) => (p + 1) % results.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((p) => (p - 1 + results.length) % results.length); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const action = results[selectedIndex];
      if (action) { setCommandPalette(false); action.action(router); }
    } else if (e.key === "Escape") { setCommandPalette(false); }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            onClick={() => setCommandPalette(false)}
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
          />
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-xl bg-surface border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center px-4 border-b border-border">
              <Search className="w-5 h-5 text-muted shrink-0" />
              <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="w-full px-4 py-4 bg-transparent outline-none text-text placeholder:text-muted font-mono text-sm"
              />
              <kbd className="px-2 py-1 text-[10px] rounded bg-surface2 text-muted border border-border font-mono">ESC</kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="p-8 text-center text-muted font-mono text-sm">No results found.</div>
              ) : (
                <div className="space-y-1">
                  {results.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <div key={item.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => { setCommandPalette(false); item.action(router); }}
                        className={cn("flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors",
                          isSelected ? "bg-surface2 text-accent" : "text-text2 hover:bg-surface2/50 hover:text-text"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted font-mono">{item.type}</span>
                          {isSelected && <ArrowRight className="w-4 h-4 text-accent" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
