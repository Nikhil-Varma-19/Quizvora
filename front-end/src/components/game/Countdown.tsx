import { useEffect, useState } from "react";
import "./game.css";

interface CountdownProps {
  /** Timestamp (ms) the question was shown at. */
  startedAt: number;
  durationSeconds: number;
}

/** Client-side countdown derived from when the question appeared - the backend sends no timer events. */
export default function Countdown({ startedAt, durationSeconds }: CountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  if (durationSeconds <= 0) return null;

  const remaining = Math.max(
    0,
    Math.ceil(durationSeconds - (now - startedAt) / 1000),
  );

  return (
    <span className={`countdown${remaining <= 5 ? " countdown--low" : ""}`}>
      {remaining}
    </span>
  );
}
