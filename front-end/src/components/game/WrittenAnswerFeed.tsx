import type { WrittenStats } from "../../types/game";
import "./game.css";

/** Host-only live feed - the backend sends written stats solely to the room admin. */
export default function WrittenAnswerFeed({ stats }: { stats: WrittenStats | null }) {
  if (!stats || stats.answers.length === 0) {
    return (
      <p className="muted">Written responses will appear here as players answer.</p>
    );
  }

  return (
    <div className="feed">
      {stats.answers.map((a, idx) => (
        <div className="feed__item" key={idx}>
          <strong>{a.participantId?.name ?? "Unknown"}</strong>
          <p>{a.writtenAnswer}</p>
        </div>
      ))}
    </div>
  );
}
