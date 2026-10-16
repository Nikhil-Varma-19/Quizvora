import { useState } from "react";
import Button from "../ui/Button/Button";
import Alert from "../ui/Alert/Alert";
import QuestionEditor from "./QuestionEditor";
import {
  makeQuestion,
  toQuestionInput,
  validateDraft,
} from "../../lib/questionDraft";
import type { QuestionInput } from "../../types/game";
import "./game.css";

interface LiveQuestionComposerProps {
  onCompose: (input: QuestionInput) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * Live mode: authors the NEXT question. Composing does not show it to
 * players - the host still has to press "Next question" to reveal it.
 */
export default function LiveQuestionComposer({
  onCompose,
  isSubmitting,
}: LiveQuestionComposerProps) {
  const [draft, setDraft] = useState(makeQuestion);
  const [error, setError] = useState<string | null>(null);
  const [composed, setComposed] = useState(false);

  async function handleCompose() {
    const invalid = validateDraft(draft, "Question");
    if (invalid) return setError(invalid);
    setError(null);
    try {
      await onCompose(toQuestionInput(draft));
      setComposed(true);
      setDraft(makeQuestion());
    } catch {
      // The parent surfaces the API error; keep the draft so nothing is lost.
    }
  }

  return (
    <div className="composer">
      <h3 className="composer__title">Compose next question</h3>
      <QuestionEditor
        question={draft}
        onChange={(next) => {
          setDraft(next);
          setComposed(false);
        }}
      />
      {error && <Alert message={error} />}
      {composed && !error && (
        <Alert tone="success" message='Next question composed. Click "Next question" to reveal it.' />
      )}
      <Button
        type="button"
        variant="secondary"
        block={false}
        icon="send"
        loading={isSubmitting}
        loadingText="Composing..."
        onClick={handleCompose}
      >
        Compose next question
      </Button>
    </div>
  );
}
