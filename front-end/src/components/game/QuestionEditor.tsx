import TextField from "../ui/TextField/TextField";
import SelectField from "../ui/SelectField/SelectField";
import Button from "../ui/Button/Button";
import { makeOption } from "../../lib/questionDraft";
import type { DraftQuestion } from "../../lib/questionDraft";
import type { TypeQuestion } from "../../types/game";
import "./game.css";

interface QuestionEditorProps {
  question: DraftQuestion;
  onChange: (next: DraftQuestion) => void;
}

const MAX_OPTIONS = 5;
const MIN_OPTIONS = 2;

/** Edits one question draft: MCQ (2-5 options, one correct) or written answer. */
export default function QuestionEditor({ question: q, onChange }: QuestionEditorProps) {
  const setOptions = (options: DraftQuestion["options"]) =>
    onChange({ ...q, options });

  return (
    <div className="editor">
      <div className="editor__top">
        <SelectField
          aria-label="Question type"
          value={q.type}
          onChange={(e) => onChange({ ...q, type: e.target.value as TypeQuestion })}
        >
          <option value="mcq">Multiple choice</option>
          <option value="written">Written answer</option>
        </SelectField>
      </div>

      <TextField
        placeholder="Type your question…"
        maxLength={100}
        value={q.question}
        onChange={(e) => onChange({ ...q, question: e.target.value })}
      />

      {q.type === "mcq" && (
        <div className="editor__options">
          {q.options.map((o) => (
            <div className="editor__option" key={o.key}>
              <button
                type="button"
                aria-label="Mark as correct"
                className={`editor__correct${o.isCorrect ? " editor__correct--on" : ""}`}
                onClick={() =>
                  setOptions(q.options.map((x) => ({ ...x, isCorrect: x.key === o.key })))
                }
              >
                <span className="material-symbols-outlined">check</span>
              </button>
              <TextField
                placeholder="Option text"
                maxLength={50}
                value={o.text}
                onChange={(e) =>
                  setOptions(
                    q.options.map((x) =>
                      x.key === o.key ? { ...x, text: e.target.value } : x,
                    ),
                  )
                }
              />
              <button
                type="button"
                aria-label="Remove option"
                className="icon-btn"
                disabled={q.options.length <= MIN_OPTIONS}
                onClick={() => {
                  const rest = q.options.filter((x) => x.key !== o.key);
                  // Removing the correct option leaves the first one correct.
                  if (!rest.some((x) => x.isCorrect)) rest[0] = { ...rest[0], isCorrect: true };
                  setOptions(rest);
                }}
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            block={false}
            icon="add"
            disabled={q.options.length >= MAX_OPTIONS}
            onClick={() => setOptions([...q.options, makeOption()])}
          >
            Add option
          </Button>
        </div>
      )}
    </div>
  );
}
