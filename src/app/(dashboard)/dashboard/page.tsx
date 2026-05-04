"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { StatCard } from "@/components/dashboard/StatCard";
import { FeaturedTask } from "@/components/dashboard/FeaturedTask";
import { RecentSessions } from "@/components/dashboard/RecentSessions";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id as any;
  
  const todayStats = useQuery(api.sessions.getTodayStats, userId ? { userId } : "skip");
  const userDoc = useQuery(api.users.getUser, userId ? { userId } : "skip");
  const weekStats = useQuery(api.sessions.getWeekStats, userId ? { userId } : "skip");
  
  const [issues, setIssues] = useState<any[]>([]);
  
  useEffect(() => {
    // Fetch GitHub issues
    fetch("/api/github/issues")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setIssues(data);
      })
      .catch(console.error);
  }, []);

  const sparklineData = weekStats ? weekStats.map((s: { date: string; mins: number }) => s.mins) : [];

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-syne font-bold">Good morning, {session?.user?.name?.split(" ")[0] || "Developer"}.</h1>
      </motion.div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          index={0}
          label="Deep Focus Today"
          value={todayStats?.totalMins || 0}
          format="time"
          trend={12} // Mock trend for now
        />
        <StatCard
          index={1}
          label="Tasks Completed"
          value={todayStats?.sessionsCount || 0}
          format="number"
        />
        <StatCard
          index={2}
          label="Current Streak"
          value={userDoc?.streakCount || 0}
          format="number"
          sparklineData={sparklineData}
        />
        <StatCard
          index={3}
          label="Flow Score"
          value={todayStats?.avgScore || 0}
          format="number"
          trend={todayStats?.avgScore ? todayStats.avgScore > 80 ? 5 : -2 : 0}
        />
      </div>

      {/* Middle Section: Ready to Focus */}
      <FeaturedTask topIssue={issues[0]} />

      {/* Bottom Section: Recent Sessions */}
      <RecentSessions />
    </div>
  );
}
