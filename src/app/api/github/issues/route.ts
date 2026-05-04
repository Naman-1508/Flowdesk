import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // For demo purposes, fetch issues from the authenticated user's repos
    // Real implementation would use GraphQL or multiple REST calls for pagination
    const res = await fetch("https://api.github.com/user/issues?filter=all&state=open&sort=updated", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const issues = await res.json();

    // Map to our GitHubIssue format
    const formattedIssues = issues.map((issue: any) => ({
      id: issue.node_id || issue.id.toString(),
      number: issue.number,
      title: issue.title,
      body: issue.body || "",
      labels: issue.labels.map((l: any) => ({ name: l.name, color: l.color })),
      repo: issue.repository?.name || issue.html_url.split('/').slice(-3)[0], // fallback repo name
      updatedAt: issue.updated_at,
      htmlUrl: issue.html_url,
      assignee: issue.assignee,
    }));

    return NextResponse.json(formattedIssues);
  } catch (error) {
    console.error("Error fetching GitHub issues:", error);
    // Return mock data for the demo if API fails
    return NextResponse.json([
      {
        id: "mock-1",
        number: 42,
        title: "Implement drag and drop for Kanban board",
        body: "We need to add dnd-kit for the tasks page.",
        labels: [{ name: "enhancement", color: "a2eeef" }],
        repo: "flowdesk",
        updatedAt: new Date().toISOString(),
        htmlUrl: "#",
      },
      {
        id: "mock-2",
        number: 45,
        title: "Fix timer hydration mismatch",
        body: "The timer ring flashes on initial load.",
        labels: [{ name: "bug", color: "d73a4a" }],
        repo: "flowdesk",
        updatedAt: new Date().toISOString(),
        htmlUrl: "#",
      }
    ]);
  }
}
