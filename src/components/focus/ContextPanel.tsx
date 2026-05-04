"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export function ContextPanel() {
  const { contextPanelOpen, toggleContextPanel } = useUIStore();
  const { task, rawNotes, setNotes, status } = useSessionStore();
  const { data: authSession } = useSession();
  const userId = authSession?.user?.id as any;
  
  const upsertNote = useMutation(api.notes.upsertNote);
  const existingNote = useQuery(api.notes.getForIssue, userId && task ? { userId, issueId: task.id.toString() } : "skip");

  const [contextData, setContextData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    notes: true,
    suggested: true,
  });

  useEffect(() => {
    if (task && existingNote?.content && !rawNotes) {
      setNotes(existingNote.content);
    }
  }, [task, existingNote, rawNotes, setNotes]);

  useEffect(() => {
    if (task && status === "focusing") {
      setLoading(true);
      fetch(`/api/context?issueId=${task.number}&repo=${task.repo}`)
        .then(res => res.json())
        .then(data => {
          setContextData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [task, status]);

  // Autosave notes
  useEffect(() => {
    if (!task || !userId || !rawNotes) return;
    
    const handler = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await upsertNote({ userId, issueId: task.id.toString(), content: rawNotes });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (e) {
        setSaveStatus("idle");
      }
    }, 3000);

    return () => clearTimeout(handler);
  }, [rawNotes, task, userId, upsertNote]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (status !== "focusing" && status !== "break") return null;

  return (
    <>
      <motion.button
        initial={{ x: 100 }}
        animate={{ x: contextPanelOpen ? 320 : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={toggleContextPanel}
        className="fixed top-1/2 right-0 -translate-y-1/2 bg-surface2 border border-border border-r-0 rounded-l-xl p-2 z-50 text-muted hover:text-text transition-colors shadow-lg"
      >
        <div className="flex flex-col items-center gap-2">
          {contextPanelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <span className="[writing-mode:vertical-lr] text-xs font-mono tracking-widest uppercase rotate-180">Context</span>
        </div>
      </motion.button>

      <AnimatePresence>
        {contextPanelOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[320px] bg-surface border-l border-border z-40 flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="font-syne font-bold">Context Bundle</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* AI Summary */}
              <div className="bg-surface2 rounded-xl border border-border overflow-hidden">
                <button 
                  onClick={() => toggleSection("summary")}
                  className="w-full flex items-center justify-between p-3 text-sm font-mono hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2 text-accent">
                    <span className="text-[10px] border border-accent/30 bg-accent/10 px-1.5 py-0.5 rounded">✦ AI</span>
                    Summary
                  </div>
                  {expandedSections["summary"] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <AnimatePresence>
                  {expandedSections["summary"] && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="p-3 pt-0 text-sm text-text2 font-mono">
                        {loading ? "Bundling context..." : contextData?.summary || "No summary available."}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Where You Left Off */}
              <div className="bg-surface2 rounded-xl border border-border overflow-hidden">
                <button 
                  onClick={() => toggleSection("leftoff")}
                  className="w-full flex items-center justify-between p-3 text-sm font-mono hover:bg-white/5 transition-colors"
                >
                  <span className="text-muted">Where You Left Off</span>
                  {expandedSections["leftoff"] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <AnimatePresence>
                  {expandedSections["leftoff"] && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="p-3 pt-0 text-sm text-text2 font-mono">
                        {loading ? "Analyzing..." : contextData?.whereYouLeftOff || "Fresh start on this issue."}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Suggested Next Step */}
              <div className="bg-surface2 rounded-xl border border-border overflow-hidden">
                <button 
                  onClick={() => toggleSection("suggested")}
                  className="w-full flex items-center justify-between p-3 text-sm font-mono hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2 text-accent2">
                    <span className="text-[10px] border border-accent2/30 bg-accent2/10 px-1.5 py-0.5 rounded">✦ AI</span>
                    Suggested Next Step
                  </div>
                  {expandedSections["suggested"] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <AnimatePresence>
                  {expandedSections["suggested"] && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="p-3 pt-0 text-sm text-text2 font-mono">
                        {loading ? "Determining next step..." : contextData?.suggestedNextStep || "Start coding."}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notes */}
              <div className="bg-surface2 rounded-xl border border-border overflow-hidden flex flex-col h-64">
                <div className="flex items-center justify-between p-3 border-b border-border/50 shrink-0">
                  <span className="text-sm font-mono text-muted">Notes</span>
                  <AnimatePresence>
                    {saveStatus === "saved" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1 text-[10px] font-mono text-success"
                      >
                        <CheckCircle2 size={12} /> Saved
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <textarea
                  value={rawNotes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex-1 w-full bg-transparent p-3 outline-none text-sm font-mono resize-none text-text placeholder:text-muted/50"
                  placeholder="Jot down thoughts, blockers, or snippets..."
                />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
