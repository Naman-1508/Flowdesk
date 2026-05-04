import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertUser = mutation({
  args: {
    githubId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_githubId", (q: any) => q.eq("githubId", args.githubId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, { name: args.name, email: args.email, avatar: args.avatar });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      githubId: args.githubId,
      name: args.name,
      email: args.email,
      avatar: args.avatar,
      streakCount: 0,
    });
  },
});

export const getUser = query({
  args: { userId: v.optional(v.any()) },
  handler: async (ctx: any, args: any) => {
    if (!args.userId) return null;
    return await ctx.db.get(args.userId);
  },
});

export const updateStreak = mutation({
  args: { userId: v.any() },
  handler: async (ctx: any, args: any) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    const now = Date.now();
    const lastSession = user.lastSessionAt ?? 0;
    const hoursSince = (now - lastSession) / (1000 * 60 * 60);
    let newStreak = user.streakCount;
    if (hoursSince > 48) newStreak = 1;
    else if (hoursSince > 20) newStreak = user.streakCount + 1;
    await ctx.db.patch(args.userId, { streakCount: newStreak, lastSessionAt: now });
  },
});

export const updateSettings = mutation({
  args: {
    userId: v.any(),
    defaultSessionMins: v.optional(v.number()),
    defaultTotalSessions: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.userId, {
      defaultSessionMins: args.defaultSessionMins,
      defaultTotalSessions: args.defaultTotalSessions,
    });
  },
});
