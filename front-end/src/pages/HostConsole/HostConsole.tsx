import { useState } from "react";
import { Navigate } from "react-router";
import GameShell from "../../components/game/GameShell";
import AnswerPanel from "../../components/game/AnswerPanel";
import LiveQuestionComposer from "../../components/game/LiveQuestionComposer";
import WrittenAnswerFeed from "../../components/game/WrittenAnswerFeed";
import Countdown from "../../components/game/Countdown";
import McqStatsPanel from "../../components/game/McqStatsPanel";
import Card from "../../components/ui/Card/Card";
import Badge from "../../components/ui/Badge/Badge";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import Modal from "../../components/ui/Modal/Modal";
import LeaveRoomButton from "../../components/game/LeaveRoomButton";
import { createLiveQuestion } from "../../lib/api";
import { emitWithAck } from "../../lib/socket";
import { useAppSelector } from "../../store";
import type { QuestionInput } from "../../types/game";

export default function HostConsole() {
  const {
    roomId,
    isHost,
    mode,
    status,
    currentQuestion,
    members,
    writtenStats,
    myMcqStats,
    hasAnswered,
    questionShownAt,
  } = useAppSelector((s) => s.game);

  const [error, setError] = useState<string | null>(null);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [composing, setComposing] = useState(false);
  // Live mode: the next question is saved but not yet shown to players.
  const [queued, setQueued] = useState(false);
  // Live mode: the question-entry modal opens at start and again after every question.
  const [composerOpen, setComposerOpen] = useState(true);

  if (!roomId || !isHost) return <Navigate to="/" replace />;
  if (status === "ended") return <Navigate to="/results" replace />;

  const isLive = mode === "live";
  const nextNumber = (currentQuestion?.order ?? 0) + 1;

  async function handleNext() {
    setError(null);
    setAdvancing(true);
    try {
      const ack = await emitWithAck<{ roomId: string }, null>("question:next", {
        roomId: roomId!,
      });
      if (!ack.success) setError(ack.message || "Could not advance the quiz.");
      else {
        setQueued(false);
        setComposerOpen(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not advance the quiz.");
    } finally {
      setAdvancing(false);
    }
  }

  async function handleCompose(input: QuestionInput) {
    setComposeError(null);
    setComposing(true);
    try {
      await createLiveQuestion(roomId!, input);
      setQueued(true);
      setComposerOpen(false);
    } catch (err) {
      setComposeError(
        err instanceof Error ? err.message : "Could not save the question.",
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
          <Badge tone="brand">{isLive ? "Live mode" : "Predefined"}</Badge>
        </span>
        <LeaveRoomButton />
      </div>

      {currentQuestion && (
        <Card>
          <div className="row">
            <Badge>Question {currentQuestion.order}</Badge>
            <Badge tone={currentQuestion.type === "mcq" ? "brand" : "warning"}>
              {currentQuestion.type === "mcq" ? "Multiple choice" : "Written"}
            </Badge>
            {questionShownAt && (
              <Countdown
                startedAt={questionShownAt}
                durationSeconds={currentQuestion.durationSeconds}
              />
            )}
          </div>
          <h1 className="question-text">{currentQuestion.text}</h1>
          <AnswerPanel />
          {currentQuestion.type === "mcq" && myMcqStats && !hasAnswered && (
            <>
              <span className="section-label">
                <span className="material-symbols-outlined">forum</span>
                Live responses
              </span>
              <McqStatsPanel stats={myMcqStats} />
            </>
          )}
          {currentQuestion.type === "written" && (
            <>
              <span className="section-label">
                <span className="material-symbols-outlined">forum</span>
                Live responses
              </span>
              <WrittenAnswerFeed stats={writtenStats} />
            </>
          )}
        </Card>
      )}

      {/* Live mode: every question, including the first, is entered by the host in a modal. */}
      {isLive && (
        <Card>
          {queued ? (
            <Alert
              tone="success"
              message={`Question ${nextNumber} is ready. Show it to the players when you are ready.`}
            />
          ) : (
            <>
              <p className="muted">
                {currentQuestion
                  ? "Enter the next question, then show it to the players."
                  : "The quiz has started. Enter the first question to begin."}
              </p>
              <Button
                variant="secondary"
                icon="edit"
                onClick={() => setComposerOpen(true)}
              >
                {`Enter question ${nextNumber}`}
              </Button>
            </>
          )}
        </Card>
      )}

      {isLive && !queued && composerOpen && (
        <Modal
          title={`Enter question ${nextNumber}`}
          onClose={() => setComposerOpen(false)}
        >
          <LiveQuestionComposer
            title={currentQuestion ? "Next question" : "First question"}
            buttonLabel={`Save question ${nextNumber}`}
            onCompose={handleCompose}
            isSubmitting={composing}
          />
          {composeError && <Alert message={composeError} />}
        </Modal>
      )}

      {!isLive && !currentQuestion && (
        <Card>
          <p className="muted center">
            All questions are ready. Reveal question 1 to the players.
          </p>
        </Card>
      )}

      {error && <Alert message={error} />}

      <Button
        icon="chevron_right"
        loading={advancing}
        loadingText="Loading..."
        disabled={isLive && !queued}
        onClick={handleNext}
      >
        {isLive
          ? `Show question ${nextNumber} to players`
          : currentQuestion
            ? "Next question"
            : "Show question 1"}
      </Button>
    </GameShell>
  );
}
