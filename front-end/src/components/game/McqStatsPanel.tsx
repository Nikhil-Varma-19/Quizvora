import type { McqStats } from "../../types/game";
import "./game.css";

/**
 * The answering participant's OWN breakdown - the backend emits mcq
 * `question:stats` only to the socket that just answered.
 */
export default function McqStatsPanel({ stats }: { stats: McqStats }) {
  return (
    <div className="stats">
      <p className="muted">
        {stats.totalAnswers} {stats.totalAnswers === 1 ? "answer" : "answers"} so
        far · here is how your pick compares
      </p>
      {stats.options.map((opt, idx) => (
        <div className="stats__row" key={opt.optionId}>
          <div className="stats__head">
            <span>{opt.text}</span>
            <span>
              {opt.count} · {Math.round(opt.percentage)}%
            </span>
          </div>
          <div className="stats__track">
            <span
              className={`stats__fill tile--${idx % 5}`}
              style={{ width: `${opt.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
