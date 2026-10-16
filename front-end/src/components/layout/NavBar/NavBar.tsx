import { Link } from "react-router";
import "./NavBar.css";

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo">
            <span className="material-symbols-outlined">electric_bolt</span>
          </span>
          <span className="navbar__title">Quizvora</span>
        </Link>

        <nav className="navbar__actions">
          <Link to="/join" className="navbar__room-btn">
            <span className="material-symbols-outlined">pin</span>
            <span>Enter room code</span>
          </Link>
          <Link to="/login" className="navbar__login">
            Log in
          </Link>
          <Link to="/register" className="navbar__signup">
            Sign up
          </Link>
          <div className="navbar__avatar">
            <span className="material-symbols-outlined">person</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
