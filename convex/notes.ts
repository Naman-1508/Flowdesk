import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertNote = mutation({
  args: {
    userId: v.any(),
    issueId: v.string(),
    content: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db.query("notes")
      .withIndex("by_userId_issueId", (q: any) => q.eq("userId", args.userId).eq("issueId", args.issueId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { content: args.content, updatedAt: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert("notes", { userId: args.userId, issueId: args.issueId, content: args.content, updatedAt: Date.now() });
  },
});

export const getForIssue = query({
  args: { userId: v.optional(v.any()), issueId: v.string() },
  handler: async (ctx: any, args: any) => {
    if (!args.userId) return null;
    return await ctx.db.query("notes")
      .withIndex("by_userId_issueId", (q: any) => q.eq("userId", args.userId).eq("issueId", args.issueId))
      .first();
  },
});
