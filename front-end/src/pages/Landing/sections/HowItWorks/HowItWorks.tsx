import { useEffect, useState } from "react";
import "./HowItWorks.css";

const distribution = [
  { label: "Saturn (Correct)", pct: 72, variant: "primary" },
  { label: "Jupiter", pct: 18, variant: "secondary" },
  { label: "Others", pct: 10, variant: "outline" },
];

export default function HowItWorks() {
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (!celebrating) return;
    const timer = setTimeout(() => setCelebrating(false), 2600);
    return () => clearTimeout(timer);
  }, [celebrating]);

  return (
    <section className="how">
      <div className="how__header">
        <span className="how__eyebrow">Simple from start to finish</span>
        <h2 className="how__title">From idea to leaderboard in minutes.</h2>
        <p className="how__subtitle">
          Create the room, invite your players, and watch every answer unfold on
          the dynamic stage.
        </p>
      </div>

      <div className="how__grid">
        {/* Steps */}
        <div className="how__steps">
          <div className="how__step">
            <div className="how__step-info">
              <div className="how__step-num how__step-num--primary">1</div>
              <div>
                <h3 className="how__step-title">Create your quiz format</h3>
                <p className="how__step-text">
                  Toggle format presets or import pre-made question sets.
                </p>
              </div>
            </div>
            <div className="how__toggle">
              <span className="how__toggle-opt how__toggle-opt--active">Live host</span>
              <span className="how__toggle-opt">Self-paced</span>
            </div>
          </div>

          <div className="how__step">
            <div className="how__step-info">
              <div className="how__step-num how__step-num--pink">2</div>
              <div>
                <h3 className="how__step-title">Share room code</h3>
                <p className="how__step-text">
                  No account required for participants. Just type and tap.
                </p>
              </div>
            </div>
            <div className="how__code">
              <span className="how__code-value">QZ-4821</span>
              <span className="how__code-count">
                <span className="material-symbols-outlined">group</span> 24 in room
              </span>
            </div>
          </div>

          <div className="how__step how__step--column">
            <div className="how__step-info">
              <div className="how__step-num how__step-num--teal">3</div>
              <div>
                <h3 className="how__step-title">Push questions &amp; reveal answers</h3>
                <p className="how__step-text">
                  Dynamic bar chart distributions render immediately as answers
                  pour in.
                </p>
              </div>
            </div>
            <div className="how__chart">
              <div className="how__chart-head">
                <span>Live voting distribution</span>
                <span className="how__chart-rate">96% response rate</span>
              </div>
              <div className="how__bars">
                {distribution.map((d) => (
                  <div key={d.label}>
                    <div className="how__bar-label">
                      <span>{d.label}</span>
                      <span>{d.pct}%</span>
                    </div>
                    <div className="how__bar-track">
                      <div
                        className={`how__bar-fill how__bar-fill--${d.variant}`}
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="how__side">
          <div className="how__board">
            <div className="how__board-head">
              <div className="how__board-title">
                <span className="material-symbols-outlined">workspace_premium</span>
                <span>Live Leaderboard</span>
              </div>
              <span className="how__round">Round 4/10</span>
            </div>

            <div className="how__ranks">
              <div className="how__rank how__rank--first">
                <div className="how__rank-who">
                  <div className="how__rank-badge how__rank-badge--gold">1</div>
                  <div>
                    <div className="how__rank-name">Maya Chen <span>👑</span></div>
                    <div className="how__rank-note how__rank-note--good">
                      <span className="material-symbols-outlined">trending_up</span>
                      4 fast answers
                    </div>
                  </div>
                </div>
                <div className="how__rank-score">
                  <div className="how__rank-pts how__rank-pts--gold">8,420</div>
                  <div className="how__rank-unit">PTS</div>
                </div>
              </div>

              <div className="how__rank">
                <div className="how__rank-who">
                  <div className="how__rank-badge how__rank-badge--silver">2</div>
                  <div>
                    <div className="how__rank-name">Jordan Lee</div>
                    <div className="how__rank-note">Streak: 3 in a row</div>
                  </div>
                </div>
                <div className="how__rank-score">
                  <div className="how__rank-pts">7,980</div>
                  <div className="how__rank-unit">PTS</div>
                </div>
              </div>

              <div className="how__rank">
                <div className="how__rank-who">
                  <div className="how__rank-badge how__rank-badge--bronze">3</div>
                  <div>
                    <div className="how__rank-name">Priya Shah</div>
                    <div className="how__rank-note">Streak: 2 in a row</div>
                  </div>
                </div>
                <div className="how__rank-score">
                  <div className="how__rank-pts">7,450</div>
                  <div className="how__rank-unit">PTS</div>
                </div>
              </div>

              <div className="how__rank how__rank--minor">
                <div className="how__rank-who">
                  <div className="how__rank-badge how__rank-badge--plain">4</div>
                  <div className="how__rank-name how__rank-name--minor">Alex Novak</div>
                </div>
                <div className="how__rank-minor-pts">6,890 PTS</div>
              </div>
            </div>

            <div className="how__board-foot">
              <span>Host controls: Next slide queued</span>
              <button
                type="button"
                className="how__celebrate"
                onClick={() => setCelebrating(true)}
              >
                Celebrate winner 🎉
              </button>
            </div>
          </div>

          <div className="how__callout">
            <div className="how__callout-icon">
              <span className="material-symbols-outlined">speed</span>
            </div>
            <div>
              <h4 className="how__callout-title">Zero-lag WebSockets</h4>
              <p className="how__callout-text">
                Scores recompute in under 50ms across thousands of participants.
              </p>
            </div>
          </div>
        </div>
      </div>

      {celebrating && (
        <div className="how__banner" role="status">
          <span>🏆</span>
          <strong>Maya Chen crowned Round 4 Champion!</strong>
        </div>
      )}
    </section>
  );
}
