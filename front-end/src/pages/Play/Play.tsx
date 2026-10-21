import { Navigate } from "react-router";
import GameShell from "../../components/game/GameShell";
import AnswerPanel from "../../components/game/AnswerPanel";
import Countdown from "../../components/game/Countdown";
import Card from "../../components/ui/Card/Card";
import Badge from "../../components/ui/Badge/Badge";
import LeaveRoomButton from "../../components/game/LeaveRoomButton";
import { useAppSelector } from "../../store";

export default function Play() {
  const { roomId, isHost, status, currentQuestion, questionShownAt } =
    useAppSelector((s) => s.game);

  if (!roomId) return <Navigate to="/" replace />;
  if (isHost) return <Navigate to="/host-console" replace />;
  if (status === "ended") return <Navigate to="/results" replace />;

  return (
    <GameShell>
      <div className="row">
        <span />
        <LeaveRoomButton />
      </div>
      {!currentQuestion ? (
        <Card className="card--center">
          <h1 className="page-title">Get ready!</h1>
          <p className="muted">The host will send the next question any moment now.</p>
        </Card>
      ) : (
        <>
          <div className="row">
            <Badge>Question {currentQuestion.order}</Badge>
            {questionShownAt && (
              <Countdown
                startedAt={questionShownAt}
                durationSeconds={currentQuestion.durationSeconds}
              />
            )}
          </div>
          <Card>
            <h1 className="question-text center">{currentQuestion.text}</h1>
          </Card>
          <AnswerPanel />
        </>
      )}
    </GameShell>
  );
}
