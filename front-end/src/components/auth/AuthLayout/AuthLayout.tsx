import type { ReactNode } from "react";
import { Link } from "react-router";
import "./AuthLayout.css";

const STATS = [
  { value: "48k", label: "Live Rooms", tone: "yellow" },
  { value: "<12ms", label: "Buzzer Sync", tone: "teal" },
  { value: "Top 1%", label: "Player Ranks", tone: "pink" },
];

const FEATURES = [
  {
    title: "Host or Play Anytime",
    text: "Launch multiplayer rooms or join games with zero-lag buzzers.",
  },
  {
    title: "Complete Match & Quiz History",
    text: "Host analytics, audience accuracy, and scorecards in one hub.",
  },
  {
    title: "Badges, Streaks & Trophies",
    text: "Earn seasonal XP and climb local or global leaderboards.",
  },
];

interface AuthLayoutProps {
  eyebrow: string;
  switchText: string;
  switchLabel: string;
  switchTo: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({
  eyebrow,
  switchText,
  switchLabel,
  switchTo,
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <main className="auth">
      <div className="auth__card">
        <aside className="auth__brand">
          <div className="auth__glow auth__glow--top" />
          <div className="auth__glow auth__glow--bottom" />

          <div className="auth__brand-head">
            <Link to="/" className="auth__logo">
              <span className="auth__logo-mark">Q</span>
              <span className="auth__logo-text">Quizvora</span>
            </Link>
            <span className="auth__pill">All-in-one account</span>
          </div>

          <div className="auth__hero">
            <h1 className="auth__hero-title">
              Host with power.
              <br />
              Play with pride.
              <br />
              <span className="auth__gradient-text">
                One account for everything.
              </span>
            </h1>
            <p className="auth__hero-text">
              Create live quizzes or jump into rooms as a participant. Your
              questions, podium finishes, stats, and badges live in one unified
              profile.
            </p>

            <div className="auth__panel">
              <div className="auth__panel-head">
                <span>Unified Portal • v4.2 Live</span>
                <span className="auth__synced">Synced</span>
              </div>
              <div className="auth__stats">
                {STATS.map((s) => (
                  <div className="auth__stat" key={s.label}>
                    <span
                      className={`auth__stat-value auth__stat-value--${s.tone}`}
                    >
                      {s.value}
                    </span>
                    <span className="auth__stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
              <ul className="auth__features">
                {FEATURES.map((f) => (
                  <li key={f.title}>
                    <span className="material-symbols-outlined">
                      check_circle
                    </span>
                    <span>
                      <strong>{f.title}</strong> — {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="auth__brand-foot">
            <p>Have a room code?</p>
            <Link to="/join" className="auth__room-btn">
              <span>Enter Room Code</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </aside>

        <section className="auth__form-pane">
          <div className="auth__switch">
            <span className="auth__eyebrow">{eyebrow}</span>
            <span className="auth__switch-text">
              {switchText} <Link to={switchTo}>{switchLabel}</Link>
            </span>
          </div>

          <div className="auth__form-wrap">
            <div>
              <h2 className="auth__title">{title}</h2>
              <p className="auth__subtitle">{subtitle}</p>
            </div>
            {children}
            <div className="auth__guest">
              <span className="material-symbols-outlined">pin</span>
              <div>
                <div className="auth__guest-head">
                  <strong>Quick guest access</strong>
                  <Link to="/join">
                    Enter Room PIN
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </Link>
                </div>
                <span>
                  Joining a live game right now without logging in? Enter your
                  pin to play instantly.
                </span>
              </div>
            </div>
          </div>

          <p className="auth__legal">
            By continuing, you agree to the Quizvora{" "}
            <Link to="/terms">Terms of Service</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
