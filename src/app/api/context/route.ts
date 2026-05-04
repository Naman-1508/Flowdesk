import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Groq from "groq-sdk";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "mock" });
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder-convex-url.convex.cloud");

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const issueId = searchParams.get("issueId");
  const repo = searchParams.get("repo");

  if (!issueId || !repo) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  try {
    // Check cache
    const cached = await convex.query(api.contextCache.getCache, { issueId });
    if (cached) return NextResponse.json(cached);

    let data;

    if (process.env.GROQ_API_KEY) {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a developer assistant. Given a GitHub issue and context,
            return ONLY valid JSON (no markdown, no explanation) with this exact shape:
            {
              "summary": "2-3 sentence plain english summary of the issue",
              "whereYouLeftOff": "What was done in previous sessions and what's pending. If no previous sessions, say 'Fresh start on this issue.'",
              "suggestedNextStep": "Single concrete next action to take right now",
              "keyFiles": ["path/to/file.ts", "path/to/other.ts"]
            }`
          },
          {
            role: "user",
            content: `Issue: ${issueId}\nRepo: ${repo}\n\nGenerate realistic mock context for this issue assuming it is a frontend task.`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0].message.content || "{}";
      data = JSON.parse(content);
    } else {
      // Mock data if no API key
      data = {
        summary: `This issue (#${issueId}) involves fixing bugs and adding new features to the ${repo} repository. It requires updating the UI components and ensuring state management works correctly.`,
        whereYouLeftOff: "Fresh start on this issue.",
        suggestedNextStep: "Review the issue description and identify the files that need to be changed.",
        keyFiles: ["src/components/ui/Button.tsx", "src/store/index.ts"]
      };
    }

    // Save to cache
    await convex.mutation(api.contextCache.setCache, { issueId, data });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Context Generation Error:", error);
    return NextResponse.json({
      summary: "Error generating summary.",
      whereYouLeftOff: "Unknown.",
      suggestedNextStep: "Please try again later.",
      keyFiles: []
    });
  }
}
