import { Link } from "react-router";
import NavBar from "../../components/layout/NavBar/NavBar";
import Footer from "../../components/layout/Footer/Footer";
import "./NotFound.css";

export default function NotFound() {
  return (
    <>
      <NavBar />
      <main className="not-found">
        <div className="not-found__card">
          <span className="not-found__code">404</span>
          <h1 className="not-found__title">Wrong room!</h1>
          <p className="not-found__text">
            The page you're looking for doesn't exist or has been moved. Check
            the URL or head back to the lobby.
          </p>
          <div className="not-found__actions">
            <Link to="/" className="not-found__btn not-found__btn--primary">
              <span className="material-symbols-outlined">home</span>
              <span>Back to home</span>
            </Link>
            <Link to="/join" className="not-found__btn not-found__btn--secondary">
              <span className="material-symbols-outlined">pin</span>
              <span>Enter room code</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
