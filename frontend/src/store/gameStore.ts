import { create } from 'zustand'
import { clearPersistedRoom, readPersistedRoom, writePersistedRoom } from '../lib/storage'
import type {
  AnswerSubmitAckData,
  McqQuestionStats,
  ModePlay,
  Question,
  ResultMode,
  RoomMember,
  SessionStatus,
  WrittenQuestionStats,
} from '../types'

interface GameState {
  // Room identity. `mode` is never returned by the backend's create
  // response (REST or socket ack) - it's captured here from whatever the
  // host just submitted, since there's nowhere else to read it from.
  roomId: string | null
  code: string | null
  title: string | null
  mode: ModePlay | null
  resultMode: ResultMode | null
  status: SessionStatus
  isHost: boolean

  members: RoomMember[]

  currentQuestion: Question | null
  questionShownAt: number | null

  hasAnsweredCurrent: boolean
  lastAnswerResult: AnswerSubmitAckData | null

  // MCQ stats come back only to the socket that just answered.
  myMcqStats: McqQuestionStats | null
  // Written stats come back only to the host's own socket, one event per
  // incoming answer - accumulate the latest snapshot per question.
  writtenStats: WrittenQuestionStats | null

  leaderboard: RoomMember[] | null
  endedMessage: string | null

  connectionError: string | null

  setRoom: (room: {
    roomId: string
    code: string
    title?: string | null
    mode?: ModePlay | null
    resultMode?: ResultMode | null
    status: SessionStatus
    isHost: boolean
  }) => void
  setStatus: (status: SessionStatus) => void
  setMembers: (members: RoomMember[]) => void
  showQuestion: (question: Question) => void
  setAnswered: (result: AnswerSubmitAckData) => void
  setMcqStats: (stats: McqQuestionStats) => void
  setWrittenStats: (stats: WrittenQuestionStats) => void
  setLeaderboard: (leaderboard: RoomMember[], message: string) => void
  setRoomEnded: (message: string) => void
  setConnectionError: (message: string | null) => void
  reset: () => void
}

const emptyState = {
  roomId: null,
  code: null,
  title: null,
  mode: null,
  resultMode: null,
  status: 'waiting' as SessionStatus,
  isHost: false,
  members: [],
  currentQuestion: null,
  questionShownAt: null,
  hasAnsweredCurrent: false,
  lastAnswerResult: null,
  myMcqStats: null,
  writtenStats: null,
  leaderboard: null,
  endedMessage: null,
  connectionError: null,
}

const persistedRoom = readPersistedRoom()

export const useGameStore = create<GameState>((set) => ({
  ...emptyState,
  ...(persistedRoom
    ? {
        roomId: persistedRoom.roomId,
        code: persistedRoom.code,
        title: persistedRoom.title,
        mode: persistedRoom.mode,
        resultMode: persistedRoom.resultMode,
        isHost: persistedRoom.isHost,
      }
    : {}),

  setRoom: (room) => {
    const title = room.title ?? null
    const mode = room.mode ?? null
    const resultMode = room.resultMode ?? null
    writePersistedRoom({
      roomId: room.roomId,
      code: room.code,
      title,
      mode,
      resultMode,
      isHost: room.isHost,
    })
    set({
      roomId: room.roomId,
      code: room.code,
      title,
      mode,
      resultMode,
      status: room.status,
      isHost: room.isHost,
      leaderboard: null,
      endedMessage: null,
    })
  },

  setStatus: (status) => set({ status }),

  setMembers: (members) => set({ members }),

  showQuestion: (question) =>
    set({
      currentQuestion: question,
      questionShownAt: Date.now(),
      hasAnsweredCurrent: false,
      lastAnswerResult: null,
      myMcqStats: null,
      writtenStats: null,
      status: 'running',
    }),

  setAnswered: (result) => set({ hasAnsweredCurrent: true, lastAnswerResult: result }),

  setMcqStats: (stats) => set({ myMcqStats: stats }),

  setWrittenStats: (stats) => set({ writtenStats: stats }),

  setLeaderboard: (leaderboard, message) =>
    set({ leaderboard, endedMessage: message, status: 'ended', currentQuestion: null }),

  setRoomEnded: (message) => set({ endedMessage: message, status: 'ended', currentQuestion: null }),

  setConnectionError: (message) => set({ connectionError: message }),

  reset: () => {
    clearPersistedRoom()
    set({ ...emptyState })
  },
}))
