"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSession } from "next-auth/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "../ui/Skeleton";
import { format, parseISO } from "date-fns";

interface WeekDay {
  date: string;
  mins: number;
}

export function WeeklyChart() {
  const { data: session } = useSession();
  const userId = session?.user?.id as any;
  const weekStats = useQuery(
    api.sessions.getWeekStats,
    userId ? { userId } : "skip"
  ) as WeekDay[] | undefined;

  if (!weekStats) {
    return <Skeleton className="w-full h-[200px] rounded-xl" />;
  }

  const data = weekStats.map((s: WeekDay) => ({
    ...s,
    label: format(parseISO(s.date), "EEE"),
    hours: Number((s.mins / 60).toFixed(1)),
  }));

  const maxHours = Math.max(...data.map((d: { hours: number }) => d.hours), 1);

  return (
    <div className="w-full h-[250px] mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--muted)",
              fontSize: 12,
              fontFamily: "var(--font-jetbrains-mono)",
            }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--muted)",
              fontSize: 12,
              fontFamily: "var(--font-jetbrains-mono)",
            }}
            dx={-10}
          />
          <Tooltip
            cursor={{ fill: "var(--surface2)" }}
            contentStyle={{
              backgroundColor: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "12px",
            }}
            formatter={((value: number) => [`${value ?? 0} hours`, "Focus Time"]) as any}
          />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {data.map((entry: { hours: number }, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.hours === maxHours ? "var(--accent)" : "var(--accent2)"}
                opacity={entry.hours === maxHours ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
