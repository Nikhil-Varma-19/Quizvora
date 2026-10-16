import { useAppSelector } from "../../store";
import "./game.css";

export default function ConnectionBanner() {
  const message = useAppSelector((s) => s.game.connectionError);
  if (!message) return null;

  return (
    <div className="conn-banner" role="status">
      <span className="material-symbols-outlined">wifi_off</span>
      {message}
    </div>
  );
}
