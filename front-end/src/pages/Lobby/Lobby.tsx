import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import GameShell from "../../components/game/GameShell";
import MemberList from "../../components/game/MemberList";
import RoomCodeBadge from "../../components/game/RoomCodeBadge";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import { emitWithAck } from "../../lib/socket";
import { useAppDispatch, useAppSelector } from "../../store";
import { resetGame, setStatus } from "../../store/gameSlice";

export default function Lobby() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { roomId, code, title, isHost, members, status } = useAppSelector(
    (s) => s.game,
  );

  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  if (!roomId) return <Navigate to="/" replace />;
  if (status === "running") {
    return <Navigate to={isHost ? "/host-console" : "/play"} replace />;
  }
  if (status === "ended") return <Navigate to="/results" replace />;

  async function handleStart() {
    setError(null);
    setStarting(true);
    try {
      const ack = await emitWithAck<{ roomId: string }, null>("quiz:start", {
        roomId: roomId!,
      });
      if (!ack.success) {
        setError(ack.message || "Could not start the quiz.");
        return;
      }
      // `quiz:started` is only broadcast to OTHER sockets, so the host routes itself.
      dispatch(setStatus("running"));
      navigate("/host-console");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the quiz.");
    } finally {
      setStarting(false);
    }
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      if (isHost) await emitWithAck("room:end", { roomId });
      else await emitWithAck("room:leave", {});
    } catch {
      // Best effort - clear local state so the user is never stuck in a dead room.
    } finally {
      dispatch(resetGame());
      navigate("/");
    }
  }

  return (
    <GameShell>
      <Card className="card--center">
        {title && <h1 className="page-title">{title}</h1>}
        {code && <RoomCodeBadge code={code} />}
        <p className="muted">
          {isHost
            ? "Share this code with your players. Start whenever everyone is in."
            : "You are in! Sit tight while the host gets things going."}
        </p>
      </Card>

      <Card>
        <span className="section-label">
          <span className="material-symbols-outlined">group</span>
          Players ({members.length})
        </span>
        <MemberList members={members} />
      </Card>

      {error && <Alert message={error} />}

      {isHost && (
        <Button
          icon="play_arrow"
          loading={starting}
          loadingText="Starting..."
          onClick={handleStart}
        >
          Start quiz
        </Button>
      )}
      <Button
        variant="secondary"
        icon="logout"
        loading={leaving}
        loadingText="Leaving..."
        onClick={handleLeave}
      >
        {isHost ? "Cancel & end room" : "Leave room"}
      </Button>
    </GameShell>
  );
}
