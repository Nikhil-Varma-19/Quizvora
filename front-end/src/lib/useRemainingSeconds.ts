import { useEffect, useState } from "react";

/** Seconds left on a timed question, or null when it has no time limit. Ticks every 250ms. */
export function useRemainingSeconds(
  startedAt: number | null,
  durationSeconds: number,
): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt || durationSeconds <= 0) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [startedAt, durationSeconds]);

  if (!startedAt || durationSeconds <= 0) return null;
  return Math.max(0, Math.ceil(durationSeconds - (now - startedAt) / 1000));
}
