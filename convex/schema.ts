import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    githubId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    slackToken: v.optional(v.string()),
    streakCount: v.number(),
    lastSessionAt: v.optional(v.number()),
    defaultSessionMins: v.optional(v.number()),
    defaultTotalSessions: v.optional(v.number()),
  }).index("by_githubId", ["githubId"]),

  sessions: defineTable({
    userId: v.string(),
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
    completedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_completedAt", ["userId", "completedAt"]),

  notes: defineTable({
    userId: v.string(),
    issueId: v.string(),
    content: v.string(),
    updatedAt: v.number(),
  }).index("by_userId_issueId", ["userId", "issueId"]),

  contextCache: defineTable({
    issueId: v.string(),
    data: v.any(),
    cachedAt: v.number(),
  }).index("by_issueId", ["issueId"]),
});
