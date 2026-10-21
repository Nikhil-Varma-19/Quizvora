import type { RoomMember } from "../../types/game";
import "./game.css";

const MEDALS = ["emoji_events", "military_tech", "workspace_premium"];

export default function LeaderboardList({ members }: { members: RoomMember[] }) {
  if (members.length === 0) {
    return <p className="muted center">No participants scored yet.</p>;
  }

  return (
    <ol className="board">
      {members.map((m, idx) => (
        <li
          className={`board__row${idx === 0 ? " board__row--first" : ""}`}
          key={`${idx}-${m.participantId?.name}`}
        >
          <span className="board__rank">
            {MEDALS[idx] ? (
              <span className={`material-symbols-outlined board__medal board__medal--${idx}`}>
                {MEDALS[idx]}
              </span>
            ) : (
              idx + 1
            )}
          </span>
          <span className="board__name">
            {m.participantId?.name ?? "Unknown"}
            {m.answered !== undefined && (
              <span className="board__detail">
                {m.correct} correct · {m.answered} answered
                {m.timedOut ? ` · ${m.timedOut} timed out (0 pts)` : ""}
              </span>
            )}
          </span>
          <span className="board__score">{m.score} pts</span>
        </li>
      ))}
    </ol>
  );
}
