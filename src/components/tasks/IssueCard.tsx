"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GitHubIssue } from "@/store/useSessionStore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface IssueCardProps {
  issue: GitHubIssue;
  lastSessionAt?: number;
}

export function IssueCard({ issue, lastSessionAt }: IssueCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={cn("touch-none outline-none", isDragging && "z-50 relative")}>
      <Card
        className={cn(
          "cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform mb-3",
          isDragging ? "opacity-90 scale-105 shadow-[0_0_24px_var(--glow)] border-accent/50" : "hover:shadow-md hover:border-border2"
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-2 flex-1">
            <Badge customColor="#6366f1">{issue.repo}</Badge>
            <span className="text-xs text-muted font-mono">#{issue.number}</span>
          </div>
          {issue.assignee && (
            <img 
              src={issue.assignee.avatar_url} 
              alt={issue.assignee.login} 
              className="w-5 h-5 rounded-full shrink-0" 
              title={issue.assignee.login}
            />
          )}
        </div>
        
        <h4 className="text-sm font-medium text-text mb-3 leading-snug">{issue.title}</h4>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-wrap gap-1">
            {issue.labels?.slice(0, 3).map((l: any) => (
              <div 
                key={l.name} 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: `#${l.color}` }}
                title={l.name}
              />
            ))}
            {issue.labels?.length > 3 && (
              <span className="text-[10px] text-muted font-mono">+{issue.labels.length - 3}</span>
            )}
          </div>
          
          <div className="text-[10px] font-mono text-muted whitespace-nowrap">
            {lastSessionAt 
              ? `Focused ${formatDistanceToNow(lastSessionAt, { addSuffix: true })}` 
              : "Never focused"}
          </div>
        </div>
      </Card>
    </div>
  );
}
