"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TooltipProps {
  children: ReactNode;
  content: string;
  shortcut?: string;
}

export function Tooltip({ children, content, shortcut }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 5, scale: 0.95 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 px-2 py-1 bg-surface2 border border-border text-xs text-text rounded shadow-lg whitespace-nowrap z-50 flex items-center gap-2"
          >
            <span>{content}</span>
            {shortcut && (
              <span className="text-[10px] text-muted bg-surface px-1 rounded font-mono border border-border">
                {shortcut}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
