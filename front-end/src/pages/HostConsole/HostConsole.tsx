import { useState } from "react";
import { Navigate } from "react-router";
import GameShell from "../../components/game/GameShell";
import AnswerPanel from "../../components/game/AnswerPanel";
import LiveQuestionComposer from "../../components/game/LiveQuestionComposer";
import WrittenAnswerFeed from "../../components/game/WrittenAnswerFeed";
import Card from "../../components/ui/Card/Card";
import Badge from "../../components/ui/Badge/Badge";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import { createLiveQuestion } from "../../lib/api";
import { emitWithAck } from "../../lib/socket";
import { useAppSelector } from "../../store";
import type { QuestionInput } from "../../types/game";

export default function HostConsole() {
  const { roomId, isHost, mode, status, currentQuestion, members, writtenStats } =
    useAppSelector((s) => s.game);

  const [error, setError] = useState<string | null>(null);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [ending, setEnding] = useState(false);
  const [composing, setComposing] = useState(false);

  if (!roomId || !isHost) return <Navigate to="/" replace />;
  if (status === "ended") return <Navigate to="/results" replace />;

  async function handleNext() {
    setError(null);
    setAdvancing(true);
    try {
      const ack = await emitWithAck<{ roomId: string }, null>("question:next", {
        roomId: roomId!,
      });
      if (!ack.success) setError(ack.message || "Could not advance the quiz.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not advance the quiz.");
    } finally {
      setAdvancing(false);
    }
  }

  async function handleEnd() {
    setEnding(true);
    try {
      await emitWithAck("room:end", { roomId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not end the room.");
    } finally {
      setEnding(false);
    }
  }

  async function handleCompose(input: QuestionInput) {
    setComposeError(null);
    setComposing(true);
    try {
      await createLiveQuestion(roomId!, input);
    } catch (err) {
      setComposeError(
        err instanceof Error ? err.message : "Could not compose the next question.",
      );
      throw err;
    } finally {
      setComposing(false);
    }
  }

  return (
    <GameShell width="lg">
      <div className="row">
        <span className="row row--gap">
          <span className="section-label">
            <span className="material-symbols-outlined">group</span>
            {members.length} players
          </span>
          <Badge tone="brand">{mode === "live" ? "Live mode" : "Predefined"}</Badge>
        </span>
        <Button variant="danger" size="sm" block={false} icon="power_settings_new" loading={ending} loadingText="Ending..." onClick={handleEnd}>
          End room
        </Button>
      </div>

      <Card>
        {currentQuestion ? (
          <>
            <div className="row">
              <Badge>Question {currentQuestion.order}</Badge>
              <Badge tone={currentQuestion.type === "mcq" ? "brand" : "warning"}>
                {currentQuestion.type === "mcq" ? "Multiple choice" : "Written"}
              </Badge>
            </div>
            <h1 className="question-text">{currentQuestion.text}</h1>
            <AnswerPanel />
            {currentQuestion.type === "written" && (
              <>
                <span className="section-label">
                  <span className="material-symbols-outlined">forum</span>
                  Live responses
                </span>
                <WrittenAnswerFeed stats={writtenStats} />
              </>
            )}
          </>
        ) : (
          <p className="muted center">
            No question is live yet.{" "}
            {mode === "live"
              ? 'Compose one below, then hit "Next question".'
              : 'Click "Next question" to reveal question 1.'}
          </p>
        )}
      </Card>

      {mode === "live" && (
        <Card>
          <LiveQuestionComposer onCompose={handleCompose} isSubmitting={composing} />
          {composeError && <Alert message={composeError} />}
        </Card>
      )}

      {error && <Alert message={error} />}

      <Button icon="chevron_right" loading={advancing} loadingText="Loading..." onClick={handleNext}>
        Next question
      </Button>
    </GameShell>
  );
}
