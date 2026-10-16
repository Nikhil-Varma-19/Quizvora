import { Link } from "react-router";
import "./Footer.css";

const links = [
  { label: "Help", to: "/help" },
  { label: "Safety", to: "/safety" },
  { label: "Terms", to: "/terms" },
  { label: "Privacy", to: "/privacy" },
];

const socials = [
  { label: "Community", icon: "forum" },
  { label: "Updates", icon: "campaign" },
  { label: "Global", icon: "language" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__name">Quizvora</span>
          <span className="footer__copy">
            © {new Date().getFullYear()} Quizvora — Made for loud rooms
          </span>
        </div>

        <nav className="footer__links">
          {links.map((link) => (
            <Link key={link.to} to={"#"} className="footer__link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="footer__socials">
          {socials.map((s) => (
            <a key={s.icon} href="#" aria-label={s.label} className="footer__social">
              <span className="material-symbols-outlined">{s.icon}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
