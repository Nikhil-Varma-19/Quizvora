import type { ReactNode } from "react";
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";
import "./InfoPage.css";

export interface InfoSection {
  heading: string;
  body: ReactNode;
}

interface InfoPageProps {
  icon: string;
  title: string;
  intro: string;
  updated?: string;
  sections: InfoSection[];
}

/** Layout for static content pages (Terms, Privacy, Help, Safety). */
export default function InfoPage({
  icon,
  title,
  intro,
  updated,
  sections,
}: InfoPageProps) {
  return (
    <>
      <NavBar />
      <main className="info">
        <article className="info__card">
          <span className="info__icon material-symbols-outlined">{icon}</span>
          <h1 className="info__title">{title}</h1>
          <p className="info__intro">{intro}</p>
          {updated && <span className="info__updated">Last updated {updated}</span>}

          {sections.map((s) => (
            <section className="info__section" key={s.heading}>
              <h2>{s.heading}</h2>
              <div>{s.body}</div>
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}
