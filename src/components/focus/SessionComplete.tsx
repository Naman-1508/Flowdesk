"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { useSessionStore } from "@/store/useSessionStore";
import { useSession } from "next-auth/react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { calculateFocusScore } from "@/lib/session-score";

export function SessionComplete() {
  const { task, plannedMins, rawNotes, reset, sessionNumber } = useSessionStore();
  const { data: authSession } = useSession();
  const userId = authSession?.user?.id as any;
  const saveSession = useMutation(api.sessions.saveSession);
  const updateStreak = useMutation(api.users.updateStreak);
  
  const [isSaving, setIsSaving] = useState(false);
  const [resumeNote, setResumeNote] = useState("");
  const [isGeneratingNote, setIsGeneratingNote] = useState(true);

  useEffect(() => {
    // Fire confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#6366f1", "#22d3ee", "#10b981"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#6366f1", "#22d3ee", "#10b981"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Generate resume note via API
    if (task && userId) {
      fetch("/api/resume-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          issueId: task.id.toString(),
          sessionDuration: plannedMins,
          rawNotes,
          issueTitle: task.title,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.resumeNote) setResumeNote(data.resumeNote);
          setIsGeneratingNote(false);
        })
        .catch(() => {
          setIsGeneratingNote(false);
        });
    } else {
      setIsGeneratingNote(false);
    }
  }, [task, userId, plannedMins, rawNotes]);

  const handleComplete = async () => {
    if (!task || !userId) return;
    setIsSaving(true);
    
    const score = calculateFocusScore({
      plannedMins,
      actualMins: plannedMins,
      sessionNumber,
      totalSessions: 4,
      wasAbandoned: false
    });

    try {
      await saveSession({
        userId,
        issueId: task.id.toString(),
        issueTitle: task.title,
        repoName: task.repo,
        plannedMins,
        actualMins: plannedMins,
        focusScore: score,
        sessionNumber,
        rawNotes,
        resumeNote,
        wasAbandoned: false,
      });
      
      await updateStreak({ userId });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
      reset();
    }
  };

  const score = calculateFocusScore({
    plannedMins,
    actualMins: plannedMins,
    sessionNumber,
    totalSessions: 4,
    wasAbandoned: false
  });

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl bg-surface border border-accent/30 rounded-3xl shadow-[0_0_64px_rgba(99,102,241,0.2)] overflow-hidden"
      >
        <div className="p-8 text-center border-b border-border">
          <h2 className="text-4xl font-syne font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent2 mb-2">
            Session Complete
          </h2>
          <p className="text-muted font-mono">You just locked in for {plannedMins} minutes.</p>
        </div>

        <div className="p-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-surface2 rounded-xl p-4 border border-border">
              <div className="text-xs font-mono text-muted uppercase mb-1">Focus Score</div>
              <div className="text-3xl font-syne font-bold text-success">{score}</div>
            </div>
            <div className="bg-surface2 rounded-xl p-4 border border-border">
              <div className="text-xs font-mono text-muted uppercase mb-1">Notes Captured</div>
              <div className="text-xl font-mono text-text">{rawNotes.length > 0 ? "Yes" : "None"}</div>
            </div>
          </div>

          <div className="flex-[2] flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-accent uppercase tracking-widest border border-accent/30 bg-accent/10 px-2 py-0.5 rounded">
                ✦ AI Resume Note
              </span>
            </div>
            {isGeneratingNote ? (
              <div className="flex-1 bg-surface2 border border-border rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-border/50 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-border/50 rounded w-full mb-2"></div>
                <div className="h-4 bg-border/50 rounded w-5/6"></div>
              </div>
            ) : (
              <textarea
                value={resumeNote}
                onChange={(e) => setResumeNote(e.target.value)}
                className="flex-1 bg-surface2 border border-border focus:border-accent outline-none rounded-xl p-4 font-mono text-sm resize-none text-text"
                placeholder="No AI note generated..."
              />
            )}
            <div className="text-[10px] text-muted font-mono mt-2 text-right">
              You can edit this before saving.
            </div>
          </div>
        </div>

        <div className="p-6 bg-surface2 border-t border-border flex justify-end gap-4">
          <Button variant="ghost" onClick={reset} disabled={isSaving}>
            Discard
          </Button>
          <Button onClick={handleComplete} disabled={isSaving} className="px-8">
            {isSaving ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
