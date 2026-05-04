"use client";

import { FocusHeatmap } from "@/components/heatmap/FocusHeatmap";
import { WeeklyChart } from "@/components/heatmap/WeeklyChart";
import { Card } from "@/components/ui/Card";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function HeatmapPage() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);

  useEffect(() => {
    // In a real app, we would send heatmap data to Groq to generate this
    // For this implementation, we'll simulate the API call
    const timer = setTimeout(() => {
      setInsight("Your peak focus is Tuesday 9-11am. Schedule deep work then.");
      setLoadingInsight(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col overflow-y-auto">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-syne font-bold mb-2">Focus Heatmap</h1>
        <p className="text-muted font-mono">Visualize your deep work habits over the last year.</p>
      </div>

      <div className="space-y-8 flex-1">
        <Card className="p-6 overflow-x-auto overflow-y-hidden border-border/50">
          <FocusHeatmap />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-border/50 p-6 flex flex-col">
            <h3 className="font-syne font-bold text-lg mb-2">Weekly Trend</h3>
            <p className="text-sm font-mono text-muted mb-4">Focus hours by day of the week.</p>
            <div className="flex-1 min-h-[250px]">
              <WeeklyChart />
            </div>
          </Card>

          <Card className="border-accent/30 bg-accent/5 p-6 relative overflow-hidden flex flex-col shadow-[0_0_24px_rgba(99,102,241,0.05)]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={100} />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-mono text-accent uppercase tracking-widest border border-accent/30 bg-accent/10 px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles size={12} /> AI Insight
              </span>
            </div>
            
            <h3 className="font-syne font-bold text-lg mb-4 text-text">Pattern Detected</h3>
            
            {loadingInsight ? (
              <div className="space-y-2 animate-pulse mt-auto">
                <div className="h-4 bg-border/50 rounded w-full"></div>
                <div className="h-4 bg-border/50 rounded w-5/6"></div>
                <div className="h-4 bg-border/50 rounded w-4/6"></div>
              </div>
            ) : (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-text2 leading-relaxed mt-auto"
              >
                {insight}
              </motion.p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
