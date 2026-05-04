import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveSession = mutation({
  args: {
    userId: v.any(),
    issueId: v.string(),
    issueTitle: v.string(),
    repoName: v.string(),
    plannedMins: v.number(),
    actualMins: v.number(),
    focusScore: v.number(),
    sessionNumber: v.number(),
    rawNotes: v.optional(v.string()),
    resumeNote: v.optional(v.string()),
    wasAbandoned: v.boolean(),
  },
  handler: async (ctx: any, args: any) => {
    return await ctx.db.insert("sessions", { ...args, completedAt: Date.now() });
  },
});

export const getRecent = query({
  args: { userId: v.optional(v.any()), limit: v.number() },
  handler: async (ctx: any, args: any) => {
    if (!args.userId) return [];
    return await ctx.db.query("sessions")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit);
  },
});

export const getTodayStats = query({
  args: { userId: v.optional(v.any()) },
  handler: async (ctx: any, args: any) => {
    if (!args.userId) return { totalMins: 0, sessionsCount: 0, avgScore: 0 };
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todaySessions = await ctx.db.query("sessions")
      .withIndex("by_userId_completedAt", (q: any) => q.eq("userId", args.userId).gte("completedAt", startOfDay))
      .collect();
    const totalMins = todaySessions.reduce((acc: number, s: any) => acc + s.actualMins, 0);
    const completed = todaySessions.filter((s: any) => !s.wasAbandoned);
    const avgScore = completed.length > 0 ? Math.round(completed.reduce((acc: number, s: any) => acc + s.focusScore, 0) / completed.length) : 0;
    return { totalMins, sessionsCount: completed.length, avgScore };
  },
});

export const getWeekStats = query({
  args: { userId: v.optional(v.any()) },
  handler: async (ctx: any, args: any) => {
    if (!args.userId) return [];
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).getTime();
    const sessions = await ctx.db.query("sessions")
      .withIndex("by_userId_completedAt", (q: any) => q.eq("userId", args.userId).gte("completedAt", startOfWeek))
      .collect();
    const days: Record<string, number> = {};
    sessions.forEach((s: any) => {
      const date = new Date(s.completedAt).toISOString().split("T")[0];
      days[date] = (days[date] || 0) + s.actualMins;
    });
    return Object.entries(days).map(([date, mins]) => ({ date, mins })).sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getHeatmapData = query({
  args: { userId: v.optional(v.any()) },
  handler: async (ctx: any, args: any) => {
    if (!args.userId) return {};
    const startOfYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).getTime();
    const sessions = await ctx.db.query("sessions")
      .withIndex("by_userId_completedAt", (q: any) => q.eq("userId", args.userId).gte("completedAt", startOfYear))
      .collect();
    const days: Record<string, { mins: number; count: number }> = {};
    sessions.forEach((s: any) => {
      const date = new Date(s.completedAt).toISOString().split("T")[0];
      if (!days[date]) days[date] = { mins: 0, count: 0 };
      days[date].mins += s.actualMins;
      if (!s.wasAbandoned) days[date].count += 1;
    });
    return days;
  },
});

export const getSessionsForIssue = query({
  args: { userId: v.optional(v.any()), issueId: v.string() },
  handler: async (ctx: any, args: any) => {
    if (!args.userId) return [];
    const all = await ctx.db.query("sessions")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return all.filter((s: any) => s.issueId === args.issueId);
  },
});
