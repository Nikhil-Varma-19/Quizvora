export type UserType = "User" | "Guest";
export type ModePlay = "live" | "predefined";
export type SessionStatus = "waiting" | "running" | "paused" | "ended";
export type ResultMode = "perQuestion" | "atLast";
export type TypeQuestion = "mcq" | "written";

export interface RoomCreatePayload {
  title: string;
  mode: ModePlay;
  resultMode: ResultMode;
}

// The backend omits `mode` from the create response, so the client remembers what it submitted.
export interface RoomCreateResponse {
  _id: string;
  title: string;
  code: string;
  status: SessionStatus;
  resultMode: ResultMode;
}

export interface RoomJoinAck {
  roomId: string;
  status: SessionStatus;
  questionId: string | null;
}

export interface QuestionOptionInput {
  text: string;
  isCorrect: boolean;
}

export type QuestionInput =
  | { question: string; type: "mcq"; options: QuestionOptionInput[] }
  | { question: string; type: "written" };

export interface BulkQuestionCreatePayload {
  noOfQuestion: number;
  questionDuration: number;
  questions: QuestionInput[];
}

export interface QuestionOption {
  _id: string;
  text: string;
}

export interface Question {
  _id: string;
  order: number;
  text: string;
  type: TypeQuestion;
  durationSeconds: number;
  remainingSeconds?: number;
  options?: QuestionOption[];
}

// The backend strips every id from member objects - never key lists by id.
export interface RoomMember {
  score: number;
  role: "admin" | "member";
  participantType: UserType;
  participantId: { name: string };
  /** Final standings only: questions answered, answered correctly, and timed out (0 pts). */
  answered?: number;
  correct?: number;
  timedOut?: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  pointsAwarded: number;
}

export interface McqStats {
  questionId: string;
  type: "mcq";
  totalAnswers: number;
  options: Array<{
    optionId: string;
    text: string;
    count: number;
    percentage: number;
  }>;
}

export interface WrittenStats {
  questionId: string;
  type: "written";
  answers: Array<{
    participantId: { name: string };
    writtenAnswer: string;
    submittedAt: string;
  }>;
}

export type QuestionStats = McqStats | WrittenStats;
