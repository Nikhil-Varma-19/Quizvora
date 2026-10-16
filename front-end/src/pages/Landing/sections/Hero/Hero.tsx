import { useState } from "react";
import { Link, useNavigate } from "react-router";
import "./Hero.css";

const answers = [
  { label: "Saturn", key: "A", variant: "pink", correct: true },
  { label: "Jupiter", key: "B", variant: "purple", correct: false },
  { label: "Neptune", key: "C", variant: "yellow", correct: false },
  { label: "Uranus", key: "D", variant: "teal", correct: false },
];

export default function Hero() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const handleJoin = () => {
    const code = roomCode.trim();
    if (code.length >= 4) {
      navigate(`/join?code=${encodeURIComponent(code.toUpperCase())}`);
    } else {
      setCodeError(true);
      setTimeout(() => setCodeError(false), 1000);
    }
  };

  const picked = selected !== null ? answers[selected] : null;
  const revealLabel = picked
    ? picked.correct
      ? "Correct! (+940 pts)"
      : "Oops! Try Saturn"
    : "Reveal results";

  return (
    <section className="hero">
      <div className="hero__blob hero__blob--primary" />
      <div className="hero__blob hero__blob--tertiary" />

      <div className="hero__grid">
        {/* Left column */}
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot-wrap">
              <span className="hero__badge-dot hero__badge-dot--ping" />
              <span className="hero__badge-dot" />
            </span>
            <span className="hero__badge-text" onClick={()=> alert("Hiiiii")}>
              Live multiplayer quizzes in seconds
            </span>
          </div>

          <h1 className="hero__title">
            Host a quiz.
            <br />
            <span className="hero__title-accent">Pack the room.</span>
            <br />
            Hear them cheer.
          </h1>

          <p className="hero__subtitle">
            Quizvora lets hosts run live or pre-built quizzes. Players join with
            a room code — as guests or members — and answer MCQ or Open text in
            real time.
          </p>

          <div className="hero__actions">
            <div
              className={`hero__join${codeError ? " hero__join--error" : ""}`}
            >
              <span className="material-symbols-outlined hero__join-icon">
                dialpad
              </span>
              <input
                className="hero__join-input"
                type="text"
                maxLength={8}
                placeholder="ENTER ROOM CODE"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <button
                type="button"
                className="hero__join-btn"
                aria-label="Join quiz with code"
                onClick={handleJoin}
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <Link to="/host" className="hero__create-btn">
              <span>Create quiz</span>
              <span className="material-symbols-outlined">add_circle</span>
            </Link>
          </div>

          <div className="hero__proof">
            <div className="hero__avatars">
              <span className="hero__avatar hero__avatar--pink">A</span>
              <span className="hero__avatar hero__avatar--teal">J</span>
              <span className="hero__avatar hero__avatar--yellow">K</span>
              <span className="hero__avatar hero__avatar--dark">2M+</span>
            </div>
            <p className="hero__proof-text">
              <strong>2M+ players</strong> joined last month
              <span className="hero__proof-sep">·</span>
              <strong>4.9/5</strong> on G2
            </p>
          </div>
        </div>

        {/* Right column: live room card */}
        <div className="hero__visual">
          <div className="hero__card-offset" />
          <div className="hero__card">
            <div className="hero__card-header">
              <div className="hero__room-pill">
                <span className="hero__room-code">ROOM 482 913</span>
                <span className="hero__live-dot" />
                <span className="hero__live-text">LIVE</span>
              </div>
              <div className="hero__dots">
                <span style={{ background: "var(--game-pink)" }} />
                <span style={{ background: "var(--game-yellow)" }} />
                <span style={{ background: "var(--game-teal)" }} />
              </div>
            </div>

            <div className="hero__question">
              <span className="hero__question-label">QUESTION 04 OF 10</span>
              <h2 className="hero__question-text">
                Which planet has the most moons?
              </h2>
            </div>

            <div className="hero__answers">
              {answers.map((a, i) => (
                <button
                  key={a.key}
                  type="button"
                  className={`hero__answer hero__answer--${a.variant}${
                    selected === i ? " is-selected" : ""
                  }${selected !== null && selected !== i ? " is-dimmed" : ""}`}
                  onClick={() => setSelected(i)}
                >
                  <span>{a.label}</span>
                  <span className="hero__answer-key">{a.key}</span>
                </button>
              ))}
            </div>

            <div className="hero__card-footer">
              <div className="hero__timer">
                <span className="material-symbols-outlined">timer</span>
                <strong>00:12</strong> left · 128 answered
              </div>
              <button
                type="button"
                className={`hero__reveal${picked?.correct ? " is-correct" : ""}`}
              >
                {revealLabel}
              </button>
            </div>

            <div className="hero__toast">
              <div className="hero__toast-icon">
                <span className="material-symbols-outlined">emoji_events</span>
              </div>
              <div>
                <div className="hero__toast-title">NovaFlash takes the lead!</div>
                <div className="hero__toast-meta">
                  <span className="hero__toast-pts">+940 pts</span>
                  <span>•</span>
                  <span>🔥 6 streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
