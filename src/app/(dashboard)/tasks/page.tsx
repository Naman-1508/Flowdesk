"use client";

import { KanbanBoard } from "@/components/tasks/KanbanBoard";

export default function TasksPage() {
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-syne font-bold mb-2">Tasks</h1>
        <p className="text-muted font-mono">Organize your GitHub issues and drag them to focus.</p>
      </div>
      
      <div className="flex-1 min-h-0">
        <KanbanBoard />
      </div>
    </div>
  );
}
