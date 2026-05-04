"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import { FileCode2 } from "lucide-react";

interface SessionRow {
  _id: string;
  issueId: string;
  issueTitle: string;
  repoName: string;
  actualMins: number;
  focusScore: number;
  wasAbandoned: boolean;
  completedAt: number;
}

export function RecentSessions() {
  const { data: session } = useSession();
  const userId = session?.user?.id as any;
  const recentSessions = useQuery(
    api.sessions.getRecent,
    userId ? { userId, limit: 5 } : "skip"
  ) as SessionRow[] | undefined;

  if (recentSessions === undefined) {
    return (
      <Card className="w-full">
        <h3 className="font-syne font-bold text-lg mb-4">Recent Sessions</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <h3 className="font-syne font-bold text-lg mb-4">Recent Sessions</h3>

      {recentSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 bg-surface2 rounded-full flex items-center justify-center mb-4 border border-border">
            <FileCode2 className="w-8 h-8 text-muted" />
          </div>
          <p className="text-muted font-mono text-sm">
            No sessions yet. Your first focus block awaits.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted font-mono text-xs uppercase tracking-wider">
                <th className="pb-3 font-medium">Task</th>
                <th className="pb-3 font-medium px-4">Repo</th>
                <th className="pb-3 font-medium px-4">Duration</th>
                <th className="pb-3 font-medium px-4">Score</th>
                <th className="pb-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((s: SessionRow, i: number) => (
                <motion.tr
                  key={s._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="group border-b border-border/50 last:border-0 hover:bg-surface2/50 transition-colors"
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted">#{s.issueId}</span>
                      <span
                        className="font-medium text-sm truncate max-w-[200px]"
                        title={s.issueTitle}
                      >
                        {s.issueTitle}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="default">{s.repoName}</Badge>
                  </td>
                  <td className="py-4 px-4 font-mono text-sm">{s.actualMins}m</td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={
                        s.focusScore >= 80
                          ? "success"
                          : s.focusScore >= 50
                          ? "warning"
                          : "danger"
                      }
                    >
                      {s.focusScore}
                    </Badge>
                  </td>
                  <td className="py-4 pl-4 text-right text-xs text-muted font-mono whitespace-nowrap">
                    {formatDistanceToNow(s.completedAt, { addSuffix: true })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
