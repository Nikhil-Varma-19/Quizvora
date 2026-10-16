import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../store";
import { logout } from "../../../store/authSlice";
import { logoutRequest } from "../../../lib/api";
import "./NavBar.css";

export default function NavBar() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutRequest();
    } catch {
      // Token may already be invalid; still clear the local session.
    }
    dispatch(logout());
    setLoggingOut(false);
    setConfirmOpen(false);
    navigate("/login");
  };
  const initial = (user?.name || user?.email || "").trim().charAt(0).toUpperCase();

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
          <Link to="/host" className="navbar__room-btn">
            <span className="material-symbols-outlined">add_circle</span>
            <span>Create quiz</span>
          </Link>
          {!user && (
            <>
              <Link to="/login" className="navbar__login">
                Log in
              </Link>
              <Link to="/register" className="navbar__signup">
                Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            className="navbar__avatar"
            title={user ? "Log out" : undefined}
            disabled={!user}
            onClick={() => setConfirmOpen(true)}
          >
            {initial ? (
              <span className="navbar__initial">{initial}</span>
            ) : (
              <span className="material-symbols-outlined">person</span>
            )}
          </button>
        </nav>
      </div>

      {confirmOpen &&
        createPortal(
        <div className="navbar__modal-backdrop" onClick={() => !loggingOut && setConfirmOpen(false)}>
          <div
            className="navbar__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="logout-title" className="navbar__modal-title">
              Are you sure you want to log out?
            </h2>
            <div className="navbar__modal-actions">
              <button
                type="button"
                className="navbar__modal-btn"
                disabled={loggingOut}
                onClick={() => setConfirmOpen(false)}
              >
                No
              </button>
              <button
                type="button"
                className="navbar__modal-btn navbar__modal-btn--primary"
                disabled={loggingOut}
                onClick={handleLogout}
              >
                {loggingOut ? "Logging out..." : "Yes"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}
