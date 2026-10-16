import { useState } from "react";
import Card from "../ui/Card/Card";
import Button from "../ui/Button/Button";
import TextField from "../ui/TextField/TextField";
import Alert from "../ui/Alert/Alert";
import QuestionEditor from "./QuestionEditor";
import {
  makeQuestion,
  toQuestionInput,
  validateDraft,
} from "../../lib/questionDraft";
import type { DraftQuestion } from "../../lib/questionDraft";
import type { BulkQuestionCreatePayload } from "../../types/game";
import "./game.css";

interface QuestionBuilderProps {
  onSubmit: (payload: BulkQuestionCreatePayload) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}

/** Predefined mode: author every question upfront before the quiz can start. */
export default function QuestionBuilder({
  onSubmit,
  isSubmitting,
  submitError,
}: QuestionBuilderProps) {
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<DraftQuestion[]>([makeQuestion()]);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit() {
    for (const [idx, q] of questions.entries()) {
      const error = validateDraft(q, `Question ${idx + 1}`);
      if (error) return setFormError(error);
    }
    setFormError(null);
    await onSubmit({
      noOfQuestion: questions.length,
      questionDuration: duration,
      questions: questions.map(toQuestionInput),
    });
  }

  return (
    <div className="builder">
      <Card>
        <div className="builder__meta">
          <div className="builder__duration">
            <TextField
              label="Seconds per question"
              type="number"
              min={0}
              max={150}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
          <p className="muted">{questions.length} question(s) authored</p>
        </div>
      </Card>

      {questions.map((q, idx) => (
        <Card key={q.key}>
          <div className="builder__head">
            <span className="builder__index">Question {idx + 1}</span>
            <button
              type="button"
              aria-label="Remove question"
              className="icon-btn"
              disabled={questions.length === 1}
              onClick={() => setQuestions(questions.filter((x) => x.key !== q.key))}
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
          <QuestionEditor
            question={q}
            onChange={(next) =>
              setQuestions(questions.map((x) => (x.key === q.key ? next : x)))
            }
          />
        </Card>
      ))}

      <Button
        type="button"
        variant="secondary"
        block={false}
        icon="add"
        onClick={() => setQuestions([...questions, makeQuestion()])}
      >
        Add question
      </Button>

      {(formError || submitError) && <Alert message={(formError || submitError)!} />}

      <Button type="button" loading={isSubmitting} loadingText="Saving..." onClick={handleSubmit}>
        Save questions &amp; continue to lobby
      </Button>
    </div>
  );
}
