import "./Modes.css";

const modes = [
  {
    icon: "bolt",
    variant: "pink",
    title: "Live mode",
    text: "Author questions on the fly or pace them slide-by-slide. Push, pause, reveal — the room follows every click in synchronized lockstep.",
    tag: "Fast-paced trivia",
  },
  {
    icon: "layers",
    variant: "yellow",
    title: "Predefined mode",
    text: "Build everything upfront. Multiple-choice, open text, countdown timers, weighted point multipliers, and intelligent auto-grading.",
    tag: "Structured tests",
  },
  {
    icon: "verified_user",
    variant: "teal",
    title: "Admin-only review",
    text: "Open-ended answers stay private to prevent copying and embarrassment. Only the host views, stars, awards bonus score, and broadcasts answers.",
    tag: "Safe & moderated",
  },
];

export default function Modes() {
  return (
    <section className="modes">
      <div className="modes__inner">
        <div className="modes__header">
          <div className="modes__heading">
            <div className="modes__eyebrow">
              <span className="material-symbols-outlined">tune</span>
              Versatile hosting engine
            </div>
            <h2 className="modes__title">
              Designed for live adrenaline or quiet focus.
            </h2>
          </div>
          <p className="modes__intro">
            Switch modes instantly depending on whether you are running an
            auditorium sprint, a remote team retro, or a classroom check-in.
          </p>
        </div>

        <div className="modes__grid">
          {modes.map((m) => (
            <div key={m.title} className={`modes__card modes__card--${m.variant}`}>
              <div className="modes__card-body">
                <div className="modes__icon">
                  <span className="material-symbols-outlined">{m.icon}</span>
                </div>
                <h3 className="modes__card-title">{m.title}</h3>
                <p className="modes__card-text">{m.text}</p>
              </div>
              <div className="modes__card-footer">
                <span>{m.tag}</span>
                <span className="material-symbols-outlined modes__arrow">
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
