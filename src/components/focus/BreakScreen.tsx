"use client";

import { motion } from "framer-motion";
import { TimerRing } from "./TimerRing";
import { useSessionStore } from "@/store/useSessionStore";
import { Button } from "../ui/Button";

const MOTIVATIONAL_QUOTES = [
  "Shipping is a muscle. You just flexed.",
  "The best code is written in focused bursts.",
  "Step away. Your subconscious is debugging now.",
  "Breathe in. Breathe out. Hydrate.",
  "Another block done. The momentum is building."
];

export function BreakScreen() {
  const { sessionNumber, totalSessions, startSession, task, plannedMins } = useSessionStore();
  
  // Random quote on mount
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#130f00]/50 backdrop-blur-sm z-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 bg-surface border border-warning/20 rounded-3xl shadow-[0_0_64px_rgba(245,158,11,0.1)]"
      >
        <h2 className="text-3xl font-syne font-bold mb-8 text-warning">Break Time</h2>
        
        {/* Breathing Circle Container */}
        <div className="relative mb-12 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-48 h-48 bg-warning/5 rounded-full blur-xl pointer-events-none"
          />
          <TimerRing />
        </div>

        <p className="text-lg font-mono text-muted mb-8 max-w-md text-center italic">
          "{quote}"
        </p>

        <Button 
          variant="secondary"
          onClick={() => {
            if (task) startSession(task, plannedMins, totalSessions);
          }}
          className="border-warning/30 hover:border-warning text-warning hover:bg-warning/10"
        >
          Skip Break
        </Button>
      </motion.div>
    </div>
  );
}
