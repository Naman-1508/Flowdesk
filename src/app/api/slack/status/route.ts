import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token, emoji, text } = await request.json();
  if (!token) return NextResponse.json({ error: "No MessageSquare token" }, { status: 400 });

  try {
    const res = await fetch("https://slack.com/api/users.profile.set", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile: {
          status_text: text || "",
          status_emoji: emoji || "",
          status_expiration: 0,
        },
      }),
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.error);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
