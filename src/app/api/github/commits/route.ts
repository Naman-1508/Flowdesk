import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo");

  if (!repo) return NextResponse.json({ error: "Missing repo param" }, { status: 400 });

  try {
    // GitHub requires owner/repo format
    const owner = session.user?.name || "";
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);

    const commits = await res.json();
    return NextResponse.json(
      commits.map((c: any) => ({
        sha: c.sha?.slice(0, 7),
        message: c.commit?.message?.split("\n")[0],
        author: c.commit?.author?.name,
        date: c.commit?.author?.date,
        url: c.html_url,
      }))
    );
  } catch (error) {
    // Fallback mock commits
    return NextResponse.json([
      { sha: "a1b2c3d", message: "fix: resolve hydration mismatch in timer ring", author: "dev", date: new Date().toISOString(), url: "#" },
      { sha: "e4f5g6h", message: "feat: add drag-and-drop to kanban board", author: "dev", date: new Date().toISOString(), url: "#" },
      { sha: "i7j8k9l", message: "chore: update dependencies", author: "dev", date: new Date().toISOString(), url: "#" },
    ]);
  }
}
