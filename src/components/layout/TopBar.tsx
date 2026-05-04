"use client";

import { motion } from "framer-motion";
import { Pause, Play, XSquare } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useState } from "react";
import { AbandonModal } from "../focus/AbandonModal";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSession } from "next-auth/react";
import { calculateFocusScore } from "@/lib/session-score";

export function TopBar() {
  const { task, isPaused, pauseResume, status, abandonSession, plannedMins, sessionNumber, startedAt } = useSessionStore();
  const [isHovered, setIsHovered] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const { data: authSession } = useSession();
  const userId = authSession?.user?.id as any;
  const saveSession = useMutation(api.sessions.saveSession);

  if (status !== "focusing" && status !== "break") return null;

  const handleAbandon = async () => {
    if (!task || !userId) {
      abandonSession();
      setShowAbandonModal(false);
      return;
    }
    
    // Calculate actual mins from elapsed time
    const actual = startedAt ? Math.round((Date.now() - startedAt) / 60000) : Math.floor(plannedMins / 2);
    const score = calculateFocusScore({
      plannedMins,
      actualMins: actual,
      sessionNumber,
      totalSessions: 4,
      wasAbandoned: true
    });

    try {
      await saveSession({
        userId,
        issueId: task.id.toString(),
        issueTitle: task.title,
        repoName: task.repo,
        plannedMins,
        actualMins: actual,
        focusScore: score,
        sessionNumber,
        rawNotes: "",
        resumeNote: "",
        wasAbandoned: true,
      });
    } catch (e) {
      console.error(e);
    } finally {
      abandonSession();
      setShowAbandonModal(false);
    }
  };

  return (
    <>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-8 z-40"
      >
        <div className="flex items-center gap-4">
          {task && (
            <>
              <Badge customColor="#6366f1">{task.repo}</Badge>
              <span className="font-syne font-bold text-lg text-text max-w-md truncate">
                {task.title}
              </span>
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered || isPaused ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3"
        >
          <Button variant="ghost" size="sm" onClick={pauseResume}>
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowAbandonModal(true)} className="text-danger hover:text-danger hover:bg-danger/10">
            <XSquare size={18} />
          </Button>
        </motion.div>
      </motion.div>

      <AbandonModal 
        isOpen={showAbandonModal} 
        onClose={() => setShowAbandonModal(false)} 
        onConfirm={handleAbandon} 
      />
    </>
  );
}
