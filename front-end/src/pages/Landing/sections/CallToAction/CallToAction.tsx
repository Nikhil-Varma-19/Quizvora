import { Link } from "react-router";
import "./CallToAction.css";

export default function CallToAction() {
  return (
    <section className="cta">
      <div className="cta__card">
        <div className="cta__glow" />
        <div className="cta__content">
          <span className="cta__eyebrow">Ready to run your first trivia?</span>
          <h2 className="cta__title">
            Turn your next session into an event people talk about.
          </h2>
          <p className="cta__text">
            Free forever for small groups up to 40 players. No credit card
            required. Launch your first room in less than two minutes.
          </p>
        </div>
        <div className="cta__actions">
          <Link to="/register" className="cta__btn">
            <span>Host a quiz now</span>
            <span className="material-symbols-outlined">rocket_launch</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
