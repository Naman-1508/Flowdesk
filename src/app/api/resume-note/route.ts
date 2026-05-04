import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "mock" });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { issueTitle, sessionDuration, rawNotes } = body;

    let data;

    if (process.env.GROQ_API_KEY) {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Generate a concise developer resume note. Return ONLY valid JSON:
            {
              "resumeNote": "3-4 sentences max. What was accomplished. What's the exact next step. Any blockers or open questions."
            }`
          },
          {
            role: "user",
            content: `Task: ${issueTitle}\nTime spent: ${sessionDuration} minutes\nNotes: ${rawNotes}`
          }
        ],
        temperature: 0.2,
        max_tokens: 200,
      });

      const content = response.choices[0].message.content || "{}";
      data = JSON.parse(content);
    } else {
      data = {
        resumeNote: `Spent ${sessionDuration} minutes working on "${issueTitle}". ${rawNotes ? "Captured some notes." : "No notes captured."} Ready for the next session.`
      };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Resume Note Generation Error:", error);
    return NextResponse.json({ resumeNote: "Error generating resume note." });
  }
}
