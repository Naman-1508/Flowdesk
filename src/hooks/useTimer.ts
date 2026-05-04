"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/useSessionStore";

export function useTimer() {
  const { status, isPaused, timeLeft, tick, completeSession } = useSessionStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if ((status === "focusing" || status === "break") && !isPaused) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, isPaused, tick]);

  useEffect(() => {
    if (timeLeft === 0 && (status === "focusing" || status === "break")) {
      completeSession();
    }
  }, [timeLeft, status, completeSession]);
}
