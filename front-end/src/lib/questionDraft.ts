import type { QuestionInput, TypeQuestion } from "../types/game";

export interface DraftOption {
  key: string;
  text: string;
  isCorrect: boolean;
}

export interface DraftQuestion {
  key: string;
  type: TypeQuestion;
  question: string;
  options: DraftOption[];
}

let keySeed = 0;
const nextKey = () => `k${++keySeed}`;

export const makeOption = (isCorrect = false): DraftOption => ({
  key: nextKey(),
  text: "",
  isCorrect,
});

export const makeQuestion = (): DraftQuestion => ({
  key: nextKey(),
  type: "mcq",
  question: "",
  options: [makeOption(true), makeOption()],
});

/** Returns an error message, or null when the draft matches the backend's rules. */
export function validateDraft(q: DraftQuestion, label: string): string | null {
  if (q.question.trim().length < 3)
    return `${label}: text must be at least 3 characters.`;
  if (q.type === "mcq") {
    if (q.options.some((o) => o.text.trim().length < 1))
      return `${label}: every option needs text.`;
    if (!q.options.some((o) => o.isCorrect))
      return `${label}: mark one option as correct.`;
  }
  return null;
}

export function toQuestionInput(q: DraftQuestion): QuestionInput {
  return q.type === "mcq"
    ? {
        question: q.question.trim(),
        type: "mcq",
        options: q.options.map((o) => ({
          text: o.text.trim(),
          isCorrect: o.isCorrect,
        })),
      }
    : { question: q.question.trim(), type: "written" };
}
