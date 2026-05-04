"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, GitBranch, ExternalLink } from "lucide-react";

interface FeaturedTaskProps {
  topIssue?: any; // Will use GitHubIssue type later
}

export function FeaturedTask({ topIssue }: FeaturedTaskProps) {
  const router = useRouter();
  const startSession = useSessionStore((s) => s.startSession);

  if (!topIssue) {
    return (
      <Card elevated className="w-full flex flex-col md:flex-row items-center justify-between p-6 md:p-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center shrink-0 border border-border">
            <GitBranch className="w-6 h-6 text-muted" />
          </div>
          <div>
            <h3 className="font-syne font-bold text-xl mb-1">Ready to Focus?</h3>
            <p className="text-muted font-mono text-sm">Connect GitHub to import your issues and start shipping.</p>
          </div>
        </div>
        <Button onClick={() => router.push("/settings")} variant="secondary" className="w-full md:w-auto gap-2">
          Settings <ArrowRight size={16} />
        </Button>
      </Card>
    );
  }

  return (
    <Card elevated className="w-full flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-accent/20 shadow-[0_0_12px_var(--glow)]">
      <div className="flex-1 min-w-0 pr-6 mb-6 md:mb-0">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge customColor="#6366f1">{topIssue.repo}</Badge>
          <span className="text-muted font-mono text-xs">#{topIssue.number}</span>
          {topIssue.labels?.slice(0, 2).map((label: any) => (
            <Badge key={label.name} customColor={`#${label.color}`}>
              {label.name}
            </Badge>
          ))}
        </div>
        <h3 className="font-syne font-bold text-xl md:text-2xl mb-2 truncate" title={topIssue.title}>
          {topIssue.title}
        </h3>
        <p className="text-muted font-mono text-sm line-clamp-2">
          {topIssue.body?.substring(0, 150)}...
        </p>
      </div>

      <div className="shrink-0 w-full md:w-auto flex flex-col gap-3">
        <Button 
          size="lg" 
          onClick={() => {
            startSession(topIssue, 25);
            router.push("/focus");
          }}
          className="w-full flex items-center gap-2"
        >
          Start Focus Session <ArrowRight size={18} />
        </Button>
        <a 
          href={topIssue.htmlUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-muted hover:text-text flex items-center justify-center gap-1 transition-colors font-mono"
        >
          View on GitHub <ExternalLink size={12} />
        </a>
      </div>
    </Card>
  );
}
