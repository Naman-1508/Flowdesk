"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: number;
  format?: "number" | "time" | "percentage";
  trend?: number; // percentage change
  sparklineData?: number[];
  index: number;
}

export function StatCard({ label, value, format = "number", trend, sparklineData, index }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState("0");
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      let formatted = "";
      if (format === "time") {
        const hrs = Math.floor(latest / 60);
        const mins = Math.floor(latest % 60);
        formatted = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
      } else if (format === "percentage") {
        formatted = `${Math.round(latest)}%`;
      } else {
        formatted = Math.round(latest).toString();
      }
      setDisplayValue(formatted);
    });
  }, [springValue, format]);

  // Generate simple SVG path for sparkline
  const max = sparklineData ? Math.max(...sparklineData, 1) : 1;
  const min = sparklineData ? Math.min(...sparklineData, 0) : 0;
  const range = max - min;
  
  const pathData = sparklineData
    ? sparklineData.map((val, i) => {
        const x = (i / (sparklineData.length - 1 || 1)) * 60;
        const y = 30 - ((val - min) / (range || 1)) * 30;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      }).join(" ")
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="flex flex-col justify-between h-full relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-mono text-muted uppercase tracking-widest">{label}</span>
          {trend !== undefined && (
            <div className={`flex items-center text-[10px] font-mono ${trend >= 0 ? "text-success" : "text-danger"}`}>
              {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between mt-4">
          <motion.span className="text-3xl font-syne font-bold text-text truncate pr-2">
            {displayValue}
          </motion.span>
          
          {sparklineData && sparklineData.length > 0 && (
            <div className="w-[60px] h-[30px] shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
              <svg width="60" height="30" viewBox="0 -5 60 40" preserveAspectRatio="none">
                <motion.path
                  d={pathData}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                />
              </svg>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
