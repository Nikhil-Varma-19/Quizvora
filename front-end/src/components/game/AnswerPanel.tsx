import { useState } from "react";
import type { FormEvent } from "react";
import TextField from "../ui/TextField/TextField";
import Button from "../ui/Button/Button";
import Alert from "../ui/Alert/Alert";
import OptionTile from "./OptionTile";
import McqStatsPanel from "./McqStatsPanel";
import { emitWithAck } from "../../lib/socket";
import { useAppDispatch, useAppSelector } from "../../store";
import { setAnswered } from "../../store/gameSlice";
import type { AnswerResult } from "../../types/game";
import "./game.css";

/**
 * Answering UI for the current question, shared by players and the host.
 * MCQ shows colored tiles, written shows a text form; after answering it
 * shows the result and (for MCQ) the answerer's own stats.
 */
/** Remounts per question so the draft answer and selection reset without effects. */
export default function AnswerPanel() {
  const questionId = useAppSelector((s) => s.game.currentQuestion?._id);
  return <AnswerPanelInner key={questionId} />;
}

function AnswerPanelInner() {
  const dispatch = useAppDispatch();
  const { roomId, currentQuestion: q, hasAnswered, lastAnswerResult, myMcqStats } =
    useAppSelector((s) => s.game);

  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!q || !roomId) return null;

  async function submit(extra: { optionId: string } | { answer: string }) {
    if (!q || !roomId || hasAnswered || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const ack = await emitWithAck<object, AnswerResult>("answer:submit", {
        roomId,
        questionId: q._id,
        ...extra,
      });
      if (!ack.success || !ack.data) {
        setError(ack.message || "Could not submit your answer.");
        return;
      }
      dispatch(setAnswered(ack.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your answer.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleWritten(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return setError("Type an answer before submitting.");
    submit({ answer: text.trim() });
  }

  if (hasAnswered) {
    const graded = q.type === "mcq" && lastAnswerResult;
    const correct = !!lastAnswerResult?.isCorrect;
    return (
      <div className="answer">
        <div className={`answer__result${graded && !correct ? " answer__result--wrong" : ""}`}>
          <span className="material-symbols-outlined">check_circle</span>
          <span>
            {graded
              ? correct
                ? `Correct! +${lastAnswerResult.pointsAwarded} pts`
                : "Answer submitted - not quite right"
              : "Answer submitted"}
          </span>
        </div>
        {myMcqStats ? (
          <McqStatsPanel stats={myMcqStats} />
        ) : (
          <p className="muted">Waiting for the host to move to the next question…</p>
        )}
      </div>
    );
  }

  return (
    <div className="answer">
      {error && <Alert message={error} />}
      {q.type === "mcq" && q.options ? (
        <div className="tiles">
          {q.options.map((opt, idx) => (
            <OptionTile
              key={opt._id}
              index={idx}
              text={opt.text}
              selected={selected === opt._id}
              disabled={submitting}
              onClick={() => {
                setSelected(opt._id);
                submit({ optionId: opt._id });
              }}
            />
          ))}
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleWritten}>
          <TextField
            label="Your answer"
            maxLength={100}
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" icon="send" loading={submitting} loadingText="Submitting...">
            Submit answer
          </Button>
        </form>
      )}
    </div>
  );
}
