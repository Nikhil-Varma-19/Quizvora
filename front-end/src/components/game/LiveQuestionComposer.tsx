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
  title: string;
  buttonLabel: string;
  /** Should reject on failure so the draft is kept for another try. */
  onCompose: (input: QuestionInput) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * Live mode: authors one question at a time. Saving does not show it to
 * players - the host still has to reveal it explicitly.
 */
export default function LiveQuestionComposer({
  title,
  buttonLabel,
  onCompose,
  isSubmitting,
}: LiveQuestionComposerProps) {
  const [draft, setDraft] = useState(makeQuestion);
  const [error, setError] = useState<string | null>(null);

  async function handleCompose() {
    const invalid = validateDraft(draft, "Question");
    if (invalid) return setError(invalid);
    setError(null);
    try {
      await onCompose(toQuestionInput(draft));
      setDraft(makeQuestion());
    } catch {
      // The parent surfaces the API error; keep the draft so nothing is lost.
    }
  }

  return (
    <div className="composer">
      <h3 className="composer__title">{title}</h3>
      <QuestionEditor question={draft} onChange={setDraft} />
      {error && <Alert message={error} />}
      <Button
        type="button"
        icon="check"
        loading={isSubmitting}
        loadingText="Saving..."
        onClick={handleCompose}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
