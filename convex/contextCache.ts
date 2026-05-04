import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCache = query({
  args: { issueId: v.string() },
  handler: async (ctx: any, args: any) => {
    const cached = await ctx.db.query("contextCache")
      .withIndex("by_issueId", (q: any) => q.eq("issueId", args.issueId))
      .first();
    if (!cached) return null;
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - cached.cachedAt > oneHour) return null;
    return cached.data;
  },
});

export const setCache = mutation({
  args: { issueId: v.string(), data: v.any() },
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db.query("contextCache")
      .withIndex("by_issueId", (q: any) => q.eq("issueId", args.issueId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { data: args.data, cachedAt: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert("contextCache", { issueId: args.issueId, data: args.data, cachedAt: Date.now() });
  },
});
