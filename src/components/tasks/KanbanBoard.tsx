"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { IssueCard } from "./IssueCard";
import { GitHubIssue } from "@/store/useSessionStore";
import { Search, Filter, RefreshCw } from "lucide-react";
import Fuse from "fuse.js";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSession } from "next-auth/react";

type Column = {
  id: string;
  title: string;
  items: GitHubIssue[];
};

export function KanbanBoard() {
  const { data: session } = useSession();
  const userId = session?.user?.id as any;
  const recentSessions = useQuery(api.sessions.getRecent, userId ? { userId, limit: 100 } : "skip");

  const [columns, setColumns] = useState<Record<string, Column>>({
    todo: { id: "todo", title: "To Focus", items: [] },
    inProgress: { id: "inProgress", title: "In Progress", items: [] },
    done: { id: "done", title: "Done Today", items: [] },
  });
  
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/github/issues");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Simple mock sorting for demo
        setColumns({
          todo: { id: "todo", title: "To Focus", items: data.slice(0, Math.ceil(data.length / 2)) },
          inProgress: { id: "inProgress", title: "In Progress", items: data.slice(Math.ceil(data.length / 2), data.length - 1) },
          done: { id: "done", title: "Done Today", items: data.slice(data.length - 1) },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find columns
    let activeColumnId = "";
    let overColumnId = "";
    for (const [colId, col] of Object.entries(columns)) {
      if (col.items.find(i => i.id === activeId)) activeColumnId = colId;
      if (col.id === overId || col.items.find(i => i.id === overId)) overColumnId = colId;
    }

    if (!activeColumnId || !overColumnId) return;

    setColumns(prev => {
      const activeItems = [...prev[activeColumnId].items];
      const overItems = [...prev[overColumnId].items];

      const activeIndex = activeItems.findIndex(i => i.id === activeId);
      const overIndex = overColumnId === overId 
        ? overItems.length 
        : overItems.findIndex(i => i.id === overId);

      if (activeColumnId === overColumnId) {
        return {
          ...prev,
          [activeColumnId]: {
            ...prev[activeColumnId],
            items: arrayMove(activeItems, activeIndex, overIndex),
          }
        };
      }

      const [item] = activeItems.splice(activeIndex, 1);
      overItems.splice(overIndex, 0, item);

      return {
        ...prev,
        [activeColumnId]: { ...prev[activeColumnId], items: activeItems },
        [overColumnId]: { ...prev[overColumnId], items: overItems },
      };
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter issues..."
            className="w-full bg-surface2 border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text outline-none focus:border-accent font-mono transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="gap-2" onClick={fetchIssues} disabled={loading}>
            <RefreshCw size={14} className={cn(loading && "animate-spin")} />
            Sync
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            <Filter size={14} /> Filter
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          {Object.values(columns).map((col) => {
            const fuse = new Fuse(col.items, { keys: ["title", "repo"], threshold: 0.3 });
            const items = query ? fuse.search(query).map(r => r.item) : col.items;

            return (
              <div key={col.id} className="flex-1 min-w-[300px] flex flex-col bg-surface/50 rounded-2xl p-4 border border-border/50">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-syne font-bold text-lg">{col.title}</h3>
                  <span className="bg-surface2 text-muted px-2 py-0.5 rounded-full text-xs font-mono">
                    {items.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[150px]">
                  <SortableContext id={col.id} items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence>
                      {items.map((issue) => {
                        const lastSession = recentSessions?.find((s: any) => s.issueId === issue.id.toString());
                        return (
                          <motion.div
                            key={issue.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <IssueCard issue={issue} lastSessionAt={lastSession?.completedAt} />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </SortableContext>

                  {items.length === 0 && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-xl">
                      <p className="text-muted font-mono text-sm">Nothing to focus on. Lucky you.</p>
                    </div>
                  )}
                  {loading && items.length === 0 && (
                    <div className="space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="bg-surface2 h-24 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </DndContext>
      </div>
    </div>
  );
}
