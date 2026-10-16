import type { ReactNode } from "react";
import { Link } from "react-router";
import "../AuthLayout/AuthLayout.css";
import "./RecoveryLayout.css";

interface Feature {
  icon: string;
  title: string;
  text: string;
}

interface RecoveryLayoutProps {
  badge: string;
  headline: ReactNode;
  description: string;
  cardTitle: string;
  features: Feature[];
  footer: ReactNode;
  step: string;
  children: ReactNode;
}

export default function RecoveryLayout({
  badge,
  headline,
  description,
  cardTitle,
  features,
  footer,
  step,
  children,
}: RecoveryLayoutProps) {
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
            <span className="auth__pill">{badge}</span>
          </div>

          <div className="auth__hero">
            <h1 className="auth__hero-title">{headline}</h1>
            <p className="auth__hero-text">{description}</p>

            <div className="auth__panel">
              <div className="auth__panel-head">
                <span>{cardTitle}</span>
                <span className="auth__synced">Active</span>
              </div>
              <ul className="recovery__features">
                {features.map((f) => (
                  <li key={f.title}>
                    <span className="recovery__feature-icon material-symbols-outlined">
                      {f.icon}
                    </span>
                    <span>
                      <strong>{f.title}</strong>
                      <span className="recovery__feature-text">{f.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="auth__brand-foot">{footer}</div>
        </aside>

        <section className="auth__form-pane">
          <div className="auth__switch">
            <Link to="/login" className="recovery__back">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Sign In
            </Link>
            <span className="recovery__step">{step}</span>
          </div>
          <div className="auth__form-wrap">{children}</div>
          <div />
        </section>
      </div>
    </main>
  );
}
