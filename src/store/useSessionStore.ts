import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GitHubIssue {
  id: string;
  number: number;
  title: string;
  body: string;
  labels: { name: string; color: string }[];
  repo: string;
  updatedAt: string;
  htmlUrl: string;
  assignee?: { avatar_url: string; login: string };
}

interface SessionState {
  status: "idle" | "focusing" | "break" | "complete";
  task: GitHubIssue | null;
  sessionNumber: number;
  totalSessions: number;
  plannedMins: number;
  timeLeft: number;
  startedAt: number | null;
  isPaused: boolean;
  rawNotes: string;

  // Actions
  startSession: (task: GitHubIssue, plannedMins: number, totalSessions?: number) => void;
  pauseResume: () => void;
  tick: () => void;
  completeSession: () => void;
  startBreak: () => void;
  abandonSession: () => void;
  reset: () => void;
  setNotes: (notes: string) => void;
  setTimeLeft: (time: number) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      status: "idle",
      task: null,
      sessionNumber: 1,
      totalSessions: 4,
      plannedMins: 25,
      timeLeft: 25 * 60,
      startedAt: null,
      isPaused: false,
      rawNotes: "",

      startSession: (task, plannedMins, totalSessions = 4) => set({
        status: "focusing",
        task,
        plannedMins,
        totalSessions,
        timeLeft: plannedMins * 60,
        startedAt: Date.now(),
        isPaused: false,
      }),

      pauseResume: () => set((state) => ({ isPaused: !state.isPaused })),

      tick: () => set((state) => {
        if (state.isPaused || state.status !== "focusing" && state.status !== "break") return state;
        const newTime = Math.max(0, state.timeLeft - 1);
        if (newTime === 0) {
          // Time is up, we should transition externally but we can set status here
          // Actually, let's just leave it at 0 and let a hook call completeSession
        }
        return { timeLeft: newTime };
      }),

      completeSession: () => set({ status: "complete" }),

      startBreak: () => set((state) => {
        const isLongBreak = state.sessionNumber >= state.totalSessions;
        const breakMins = isLongBreak ? 30 : 5;
        return {
          status: "break",
          timeLeft: breakMins * 60,
          startedAt: Date.now(),
          sessionNumber: isLongBreak ? 1 : state.sessionNumber + 1,
          isPaused: false,
        };
      }),

      abandonSession: () => set({
        status: "idle",
        task: null,
        startedAt: null,
        isPaused: false,
        timeLeft: 0,
        rawNotes: "",
      }),

      reset: () => set({
        status: "idle",
        task: null,
        sessionNumber: 1,
        startedAt: null,
        isPaused: false,
        timeLeft: 0,
        rawNotes: "",
      }),

      setNotes: (notes) => set({ rawNotes: notes }),
      
      setTimeLeft: (time) => set({ timeLeft: time }),
    }),
    {
      name: "flowdesk-session",
    }
  )
);
