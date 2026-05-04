"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { useTimer } from "@/hooks/useTimer";
import { TaskSelector } from "@/components/focus/TaskSelector";
import { TimerRing } from "@/components/focus/TimerRing";
import { ContextPanel } from "@/components/focus/ContextPanel";
import { BreakScreen } from "@/components/focus/BreakScreen";
import { SessionComplete } from "@/components/focus/SessionComplete";
import { TopBar } from "@/components/layout/TopBar";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function FocusPage() {
  const { status, startSession } = useSessionStore();
  const shouldReduceMotion = useReducedMotion();
  useTimer();

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center">
      <TopBar />
      <ContextPanel />

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="selector"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(8px)", scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full flex items-center justify-center p-8"
          >
            <TaskSelector
              onSelect={(task, duration) => startSession(task, duration)}
            />
          </motion.div>
        )}

        {(status === "focusing" || status === "complete") && (
          <motion.div
            key="timer"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.1 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="w-full h-full flex items-center justify-center relative"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--bg)_100%)] pointer-events-none z-0 opacity-80" />
            <div className="z-10 relative">
              <TimerRing />
            </div>
          </motion.div>
        )}

        {status === "break" && (
          <motion.div
            key="break"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full"
          >
            <BreakScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === "complete" && <SessionComplete />}
      </AnimatePresence>
    </div>
  );
}
