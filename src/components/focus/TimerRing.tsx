"use client";

import { motion } from "framer-motion";
import { useSessionStore } from "@/store/useSessionStore";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function TimerRing() {
  const { timeLeft, plannedMins, status, sessionNumber, totalSessions } = useSessionStore();
  const totalSeconds = status === "break" ? (sessionNumber >= totalSessions ? 30 * 60 : 5 * 60) : plannedMins * 60;
  
  const progress = totalSeconds > 0 ? timeLeft / totalSeconds : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  const isLowTime = timeLeft <= 300 && status === "focusing"; // last 5 minutes
  const isCriticalTime = timeLeft <= 60 && status === "focusing"; // last 1 minute

  let ringColor = "var(--accent)";
  if (isCriticalTime) ringColor = "var(--danger)";
  else if (isLowTime) ringColor = "var(--accent2)";

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative w-[260px] h-[260px]">
        {/* Base Ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="none"
            stroke="var(--surface2)"
            strokeWidth="8"
          />
          {/* Progress Ring */}
          <motion.circle
            cx="130"
            cy="130"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset, stroke: ringColor }}
            transition={{ strokeDashoffset: { type: "tween", duration: 1, ease: "linear" }, stroke: { duration: 1 } }}
            style={{
              filter: `drop-shadow(0 0 ${isLowTime ? '24px' : '12px'} ${ringColor}80)`,
            }}
            className={cn(isLowTime && "animate-[pulse_2s_ease-in-out_infinite]")}
          />
        </svg>

        {/* Time Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div 
            className={cn(
              "font-syne font-extrabold text-5xl tracking-tighter tabular-nums",
              isCriticalTime && "text-danger animate-pulse"
            )}
            layout
          >
            {formattedTime}
          </motion.div>
          <div className="text-muted font-mono text-sm mt-2">
            {status === "break" ? "Break" : `Session ${sessionNumber} of ${totalSessions}`}
          </div>
        </div>
      </div>
    </div>
  );
}
