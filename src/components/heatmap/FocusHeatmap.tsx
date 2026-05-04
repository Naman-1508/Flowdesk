"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { format, subDays, startOfWeek, addDays } from "date-fns";
import { cn } from "@/lib/utils";

export function FocusHeatmap() {
  const { data: session } = useSession();
  const userId = session?.user?.id as any;
  const heatmapData = useQuery(api.sessions.getHeatmapData, userId ? { userId } : "skip");

  const [hoveredCell, setHoveredCell] = useState<{ date: string; mins: number; count: number; x: number; y: number } | null>(null);

  if (!heatmapData) {
    return <div className="w-full h-[150px] bg-surface2 animate-pulse rounded-xl" />;
  }

  const today = new Date();
  const endDate = today;
  const startDate = subDays(endDate, 364);
  const startDayOfWeek = startOfWeek(startDate, { weekStartsOn: 0 }); // Sunday

  const weeks = [];
  let currentDate = startDayOfWeek;

  while (currentDate <= endDate) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const data = heatmapData[dateStr] || { mins: 0, count: 0 };
      
      let intensityClass = "bg-surface"; // 0 mins
      if (data.mins > 0 && data.mins < 30) intensityClass = "bg-accent/20 border border-accent/10";
      else if (data.mins >= 30 && data.mins < 60) intensityClass = "bg-accent/40 border border-accent/20";
      else if (data.mins >= 60 && data.mins < 120) intensityClass = "bg-accent/70 border border-accent/30";
      else if (data.mins >= 120) intensityClass = "bg-accent border border-accent/50 shadow-[0_0_8px_var(--glow)]";

      week.push({
        date: dateStr,
        ...data,
        intensityClass,
        isFuture: currentDate > today,
      });
      currentDate = addDays(currentDate, 1);
    }
    weeks.push(week);
  }

  // Generate month labels
  const monthLabels: { index: number; label: string }[] = [];
  let currentMonth = -1;
  weeks.forEach((week, i) => {
    const d = new Date(week[0].date);
    if (d.getMonth() !== currentMonth) {
      monthLabels.push({ index: i, label: format(d, "MMM") });
      currentMonth = d.getMonth();
    }
  });

  return (
    <div className="relative w-full overflow-x-auto pb-6">
      <div className="min-w-max">
        {/* Month Labels */}
        <div className="flex mb-2 h-4 relative text-[10px] text-muted font-mono ml-6">
          {monthLabels.map((m, i) => (
            <div key={i} className="absolute" style={{ left: `${m.index * 17}px` }}>
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day Labels */}
          <div className="flex flex-col gap-[3px] text-[10px] text-muted font-mono w-6 pr-2 pt-[17px]">
            <span className="leading-[14px]">Mon</span>
            <span className="leading-[14px] opacity-0">Tue</span>
            <span className="leading-[14px]">Wed</span>
            <span className="leading-[14px] opacity-0">Thu</span>
            <span className="leading-[14px]">Fri</span>
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {week.map((day, j) => (
                  <div
                    key={day.date}
                    onMouseEnter={(e) => {
                      if (!day.isFuture) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          ...day,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={cn(
                      "w-[14px] h-[14px] rounded-[3px] transition-colors duration-300",
                      day.isFuture ? "opacity-0" : day.intensityClass,
                      day.isFuture ? "pointer-events-none" : "cursor-pointer hover:border-text/50"
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full pb-2"
            style={{ left: hoveredCell.x, top: hoveredCell.y }}
          >
            <div className="bg-surface2 border border-border px-3 py-2 rounded-lg shadow-xl flex flex-col gap-1 min-w-[120px]">
              <span className="text-xs text-muted font-mono">{format(new Date(hoveredCell.date), "MMM d, yyyy")}</span>
              <span className="text-sm font-medium text-text">
                {hoveredCell.mins > 0 ? `${Math.floor(hoveredCell.mins / 60)}h ${hoveredCell.mins % 60}m` : "No focus"}
              </span>
              {hoveredCell.count > 0 && (
                <span className="text-[10px] text-accent font-mono">{hoveredCell.count} sessions</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
