"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Clock, FileText, Download, Activity } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface SessionDoc {
  _id: string;
  issueId: string;
  issueTitle: string;
  repoName: string;
  actualMins: number;
  focusScore: number;
  wasAbandoned: boolean;
  completedAt: number;
  rawNotes?: string;
  resumeNote?: string;
}

export default function SessionsPage() {
  const { data: authSession } = useSession();
  const userId = authSession?.user?.id as any;
  const sessions = useQuery(api.sessions.getRecent, userId ? { userId, limit: 100 } : "skip") as SessionDoc[] | undefined;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const exportCSV = () => {
    if (!sessions) return;
    const headers = ["Task", "Repo", "Date", "Duration (m)", "Score", "Notes", "AI Resume"];
    const rows = sessions.map((s: SessionDoc) => [
      `"${s.issueTitle.replace(/"/g, '""')}"`,
      s.repoName,
      new Date(s.completedAt).toISOString(),
      s.actualMins,
      s.focusScore,
      `"${(s.rawNotes || "").replace(/"/g, '""')}"`,
      `"${(s.resumeNote || "").replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(","), ...rows.map((r: (string | number)[]) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flowdesk-sessions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  if (sessions === undefined) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const totalMinsThisWeek = sessions
    .filter((s: SessionDoc) => Date.now() - s.completedAt < 7 * 24 * 60 * 60 * 1000)
    .reduce((acc: number, s: SessionDoc) => acc + s.actualMins, 0);

  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((acc: number, s: SessionDoc) => acc + s.focusScore, 0) / sessions.length)
    : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-syne font-bold mb-2">Sessions History</h1>
          <p className="text-muted font-mono">Review your deep work and exported notes.</p>
        </div>
        <Button variant="secondary" onClick={exportCSV} className="gap-2">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 shrink-0">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-xs font-mono text-muted uppercase">This Week</div>
            <div className="text-2xl font-syne font-bold">{Math.floor(totalMinsThisWeek / 60)}h {totalMinsThisWeek % 60}m</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-xs font-mono text-muted uppercase">Avg Score</div>
            <div className="text-2xl font-syne font-bold text-success">{avgScore}</div>
          </div>
        </Card>
      </div>

      <Card className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
        <div className="overflow-y-auto flex-1 p-4">
          <div className="space-y-2">
            {(sessions as SessionDoc[]).map((s) => {
              const isExpanded = expandedId === s._id;
              return (
                <div key={s._id} className="border border-border bg-surface2/50 rounded-xl overflow-hidden transition-colors hover:border-border2">
                  <div
                    className="flex items-center p-4 cursor-pointer gap-4"
                    onClick={() => setExpandedId(isExpanded ? null : s._id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge customColor="#6366f1">{s.repoName}</Badge>
                        <span className="text-xs text-muted font-mono">#{s.issueId}</span>
                        {s.wasAbandoned && <Badge variant="danger">Abandoned</Badge>}
                      </div>
                      <div className="font-medium truncate pr-4">{s.issueTitle}</div>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm font-mono text-muted shrink-0">
                      <span>{s.actualMins}m</span>
                      <Badge variant={s.focusScore >= 80 ? "success" : s.focusScore >= 50 ? "warning" : "danger"}>
                        {s.focusScore} Score
                      </Badge>
                      <span>{format(s.completedAt, "MMM d, h:mm a")}</span>
                    </div>
                    <div className="shrink-0 text-muted">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-border bg-surface"
                      >
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="flex items-center gap-2 mb-3 text-sm font-mono text-muted uppercase">
                              <FileText size={14} /> Raw Notes
                            </div>
                            <div className="bg-surface2 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap text-text2 min-h-[100px]">
                              {s.rawNotes || <span className="italic text-muted">No notes taken.</span>}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-3 text-sm font-mono text-accent uppercase">
                              ✦ AI Resume Note
                            </div>
                            <div className="bg-surface2 border border-accent/20 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap text-text2 min-h-[100px]">
                              {s.resumeNote || <span className="italic text-muted">No AI note generated.</span>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {sessions.length === 0 && (
              <div className="text-center p-12 text-muted font-mono">
                No sessions recorded yet.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
