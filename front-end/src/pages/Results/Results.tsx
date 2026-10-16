import { Navigate, useNavigate } from "react-router";
import GameShell from "../../components/game/GameShell";
import LeaderboardList from "../../components/game/LeaderboardList";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import { useAppDispatch, useAppSelector } from "../../store";
import { resetGame } from "../../store/gameSlice";

export default function Results() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { roomId, isHost, leaderboard, endedMessage, title } = useAppSelector(
    (s) => s.game,
  );

  if (!roomId && !leaderboard && !endedMessage) return <Navigate to="/" replace />;

  function handleBack() {
    dispatch(resetGame());
    navigate(isHost ? "/host" : "/");
  }

  return (
    <GameShell>
      <Card className="card--center">
        <span className="page-head__icon material-symbols-outlined">celebration</span>
        <h1 className="page-title">{leaderboard ? "Quiz complete!" : "Room ended"}</h1>
        <p className="muted">
          {endedMessage || (title ? `${title} has finished.` : "Thanks for playing.")}
        </p>
      </Card>

      {leaderboard && (
        <Card>
          <span className="section-label">Final leaderboard</span>
          <LeaderboardList members={leaderboard} />
        </Card>
      )}

      <Button icon={isHost ? "dashboard" : "home"} onClick={handleBack}>
        {isHost ? "Back to dashboard" : "Back to home"}
      </Button>
    </GameShell>
  );
}
