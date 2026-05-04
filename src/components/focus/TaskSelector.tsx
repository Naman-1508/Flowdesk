"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { GitHubIssue } from "@/store/useSessionStore";
import Fuse from "fuse.js";
import { Badge } from "@/components/ui/Badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TaskSelectorProps {
  onSelect: (task: GitHubIssue, duration: number) => void;
}

export function TaskSelector({ onSelect }: TaskSelectorProps) {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [query, setQuery] = useState("");
  const [duration, setDuration] = useState(25);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<GitHubIssue | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    fetch("/api/github/issues")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setIssues(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const fuse = new Fuse(issues, { keys: ["title", "repo", "number"], threshold: 0.3 });
  const results = query ? fuse.search(query).map((r) => r.item) : issues;

  const handleSelect = (task: GitHubIssue) => {
    setSelectedTask(task);
    setIsFlipping(true);
    setTimeout(() => {
      onSelect(task, duration);
    }, 600); // Wait for card flip animation
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[80vh] perspective-[1000px]">
      <motion.div
        animate={isFlipping ? { rotateY: 180, opacity: 0 } : { rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 50 }}
        className="w-full transform-style-3d"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-syne font-bold mb-2">What are you working on?</h2>
          <p className="text-muted font-mono">Select an issue to start focusing.</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Search className="text-muted w-5 h-5 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search issues by title, #number, or repo..."
              className="flex-1 bg-transparent border-none outline-none text-text placeholder:text-muted font-mono"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="p-8 text-center text-muted font-mono animate-pulse">Loading issues...</div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-muted font-mono">No open issues found. Go write some code!</div>
            ) : (
              <div className="space-y-1">
                {results.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => handleSelect(issue)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl transition-all border border-transparent",
                      selectedTask?.id === issue.id 
                        ? "bg-surface2 border-accent shadow-[0_0_12px_var(--glow)] scale-[0.98]" 
                        : "hover:bg-surface2 hover:border-border2 hover:-translate-y-[2px]"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge customColor="#6366f1">{issue.repo}</Badge>
                      <span className="text-xs text-muted font-mono">#{issue.number}</span>
                      {issue.labels?.map((l: any) => (
                        <Badge key={l.name} customColor={`#${l.color}`}>{l.name}</Badge>
                      ))}
                    </div>
                    <div className="font-medium text-text">{issue.title}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-surface2 border-t border-border flex justify-center gap-4">
            {[25, 50, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={cn(
                  "px-4 py-2 rounded-full font-mono text-sm transition-all border",
                  duration === mins 
                    ? "bg-accent/20 border-accent text-accent shadow-[0_0_8px_var(--glow)]" 
                    : "bg-surface border-border text-muted hover:text-text hover:border-border2"
                )}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
