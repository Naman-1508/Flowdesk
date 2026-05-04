interface ScoreParams {
  plannedMins: number;
  actualMins: number;
  sessionNumber: number;
  totalSessions: number;
  wasAbandoned: boolean;
}

export function calculateFocusScore({
  plannedMins,
  actualMins,
  sessionNumber,
  totalSessions,
  wasAbandoned,
}: ScoreParams): number {
  if (wasAbandoned) return Math.max(0, Math.round((actualMins / plannedMins) * 40));
  let score = Math.round((actualMins / plannedMins) * 100);
  if (sessionNumber === totalSessions) score += 10; // completed full cycle bonus
  return Math.min(100, Math.max(0, score));
}
