
export type UserType = 'User' | 'Guest'

export type ModePlay = 'live' | 'predefined'

export type SessionStatus = 'waiting' | 'running' | 'paused' | 'ended'

export type Role = 'admin' | 'member'

export type ResultMode = 'perQuestion' | 'atLast'

export type TypeQuestion = 'mcq' | 'written'

export type QuestionStatus = 'pending' | 'ongoing' | 'complete'


export interface ApiSuccess<T> {
  message: string
  data: T
}

export interface ApiError {
  message: string
  error: string
}

// Auth

export interface RegisterPayload {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterResponseData {
  name: string
  email: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponseData {
  token: string
  email: string
  userId: string
  name: string
}

export interface GuestCreatePayload {
  name: string
}

export interface GuestCreateResponseData {
  name: string
  sessionId: string
}

// Room

export interface RoomCreatePayload {
  title: string
  mode: ModePlay
  resultMode: ResultMode
}

// NOTE: the backend deliberately omits `mode` from the room create response
// (both REST and the `room:create` socket ack). The frontend must remember
// the mode it just submitted locally instead of reading it back.
export interface RoomCreateResponseData {
  _id: string
  title: string
  code: string
  status: SessionStatus
  resultMode: ResultMode
  startedAt: string | null
  createdByType: UserType
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export interface QuestionOptionInput {
  text: string
  isCorrect: boolean
}

export interface McqQuestionInput {
  question: string
  type: 'mcq'
  options: QuestionOptionInput[]
}

export interface WrittenQuestionInput {
  question: string
  type: 'written'
}

export type QuestionInput = McqQuestionInput | WrittenQuestionInput

export interface BulkQuestionCreatePayload {
  noOfQuestion: number
  questionDuration: number
  questions: QuestionInput[]
}

// NOTE: the option subdocument's id field is Mongo's own `_id` (not
// `optionId` - that name is only used by the separate `question:stats`
// aggregate payload below). `isCorrect` is stripped server-side for the
// FIRST question of a predefined quiz (`quiz:start`) but, due to a backend
// inconsistency, leaks through on subsequent questions surfaced via
// `question:next`. Never rely on its presence to render a "correct" state
// on the participant screen.
export interface QuestionOption {
  _id: string
  text: string
  isCorrect?: boolean
}

export interface Question {
  _id: string
  order: number
  text: string
  type: TypeQuestion
  points?: number
  durationSeconds: number
  options?: QuestionOption[]
  isComplete: boolean
  status: QuestionStatus
}

// ---------------------------------------------------------------------------
// Members / leaderboard
// ---------------------------------------------------------------------------

// NOTE: the backend strips every id field from these objects (including the
// populated user's `_id`). Never key a list by id — use array index or name.
export interface RoomMember {
  score: number
  role: Role
  participantType: UserType
  participantId: {
    name: string
  }
}

// ---------------------------------------------------------------------------
// Socket ack payloads
// ---------------------------------------------------------------------------

export interface SocketAck<T> {
  success: boolean
  message: string
  data: T | null
}

export interface RoomJoinAckData {
  roomId: string
  status: SessionStatus
  questionId: string | null
}

export interface AnswerSubmitAckData {
  // Always a real boolean server-side - written answers simply aren't
  // auto-graded, so this (and pointsAwarded) come back `false` / `0` for them.
  isCorrect: boolean
  pointsAwarded: number
}

// ---------------------------------------------------------------------------
// Socket server -> client events
// ---------------------------------------------------------------------------

export interface QuizStartedPayload {
  message: string
  roomId: string
}

export interface QuestionShowPayload {
  message: string
  question: Question
}

export interface McqQuestionStats {
  questionId: string
  type: 'mcq'
  totalAnswers: number
  options: Array<{
    optionId: string
    text: string
    count: number
    percentage: number
  }>
}

export interface WrittenQuestionStats {
  questionId: string
  type: 'written'
  answers: Array<{
    participantId: { name: string }
    writtenAnswer: string
    submittedAt: string
  }>
}

export type QuestionStatsPayload = McqQuestionStats | WrittenQuestionStats

export interface QuizEndedPayload {
  message: string
  leaderboard: RoomMember[]
}

export interface RoomEndedPayload {
  message: string
  roomId: string
}

export interface AnswerSubmittedPayload {
  participantId: string
  questionId: string
}
