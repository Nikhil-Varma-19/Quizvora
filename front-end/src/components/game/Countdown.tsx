import { useRemainingSeconds } from "../../lib/useRemainingSeconds";
import "./game.css";

interface CountdownProps {
  /** Timestamp (ms) the question was shown at. */
  startedAt: number;
  durationSeconds: number;
}

/** Client-side countdown derived from when the question appeared - the backend sends no timer events. */
export default function Countdown({ startedAt, durationSeconds }: CountdownProps) {
  const remaining = useRemainingSeconds(startedAt, durationSeconds);
  if (remaining === null) return null;

  return (
    <span className={`countdown${remaining <= 5 ? " countdown--low" : ""}`}>
      {remaining}
    </span>
  );
}
