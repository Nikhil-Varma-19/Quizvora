import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { clearRoom, readRoom, saveRoom } from "../lib/room";
import type {
  AnswerResult,
  McqStats,
  ModePlay,
  Question,
  ResultMode,
  RoomMember,
  SessionStatus,
  WrittenStats,
} from "../types/game";

interface GameState {
  roomId: string | null;
  code: string | null;
  title: string | null;
  mode: ModePlay | null;
  resultMode: ResultMode | null;
  status: SessionStatus;
  isHost: boolean;
  members: RoomMember[];
  currentQuestion: Question | null;
  questionShownAt: number | null;
  hasAnswered: boolean;
  lastAnswerResult: AnswerResult | null;
  myMcqStats: McqStats | null;
  writtenStats: WrittenStats | null;
  leaderboard: RoomMember[] | null;
  endedMessage: string | null;
  connectionError: string | null;
}

const empty: GameState = {
  roomId: null,
  code: null,
  title: null,
  mode: null,
  resultMode: null,
  status: "waiting",
  isHost: false,
  members: [],
  currentQuestion: null,
  questionShownAt: null,
  hasAnswered: false,
  lastAnswerResult: null,
  myMcqStats: null,
  writtenStats: null,
  leaderboard: null,
  endedMessage: null,
  connectionError: null,
};

const persisted = readRoom();
const initialState: GameState = persisted ? { ...empty, ...persisted } : empty;

interface SetRoomPayload {
  roomId: string;
  code: string;
  title?: string | null;
  mode?: ModePlay | null;
  resultMode?: ResultMode | null;
  status: SessionStatus;
  isHost: boolean;
}

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setRoom(state, { payload }: PayloadAction<SetRoomPayload>) {
      state.roomId = payload.roomId;
      state.code = payload.code;
      state.title = payload.title ?? null;
      state.mode = payload.mode ?? null;
      state.resultMode = payload.resultMode ?? null;
      state.status = payload.status;
      state.isHost = payload.isHost;
      state.leaderboard = null;
      state.endedMessage = null;
      saveRoom({
        roomId: payload.roomId,
        code: payload.code,
        title: state.title,
        mode: state.mode,
        resultMode: state.resultMode,
        isHost: payload.isHost,
      });
    },
    setStatus(state, { payload }: PayloadAction<SessionStatus>) {
      state.status = payload;
    },
    setMembers(state, { payload }: PayloadAction<RoomMember[]>) {
      state.members = payload;
    },
    showQuestion(state, { payload }: PayloadAction<Question>) {
      state.currentQuestion = payload;
      // Use the server's time left when given (refresh / late join), so the clock does not restart.
      const elapsedSeconds =
        payload.remainingSeconds === undefined
          ? 0
          : payload.durationSeconds - payload.remainingSeconds;
      state.questionShownAt = Date.now() - elapsedSeconds * 1000;
      state.hasAnswered = false;
      state.lastAnswerResult = null;
      state.myMcqStats = null;
      state.writtenStats = null;
      state.status = "running";
    },
    setAnswered(state, { payload }: PayloadAction<AnswerResult>) {
      state.hasAnswered = true;
      state.lastAnswerResult = payload;
    },
    setMcqStats(state, { payload }: PayloadAction<McqStats>) {
      state.myMcqStats = payload;
    },
    setWrittenStats(state, { payload }: PayloadAction<WrittenStats>) {
      state.writtenStats = payload;
    },
    setLeaderboard(
      state,
      { payload }: PayloadAction<{ leaderboard: RoomMember[]; message: string }>,
    ) {
      state.leaderboard = payload.leaderboard;
      state.endedMessage = payload.message;
      state.status = "ended";
      state.currentQuestion = null;
    },
    setRoomEnded(state, { payload }: PayloadAction<string>) {
      state.endedMessage = payload;
      state.status = "ended";
      state.currentQuestion = null;
    },
    setConnectionError(state, { payload }: PayloadAction<string | null>) {
      state.connectionError = payload;
    },
    resetGame() {
      clearRoom();
      return empty;
    },
  },
});

export const {
  setRoom,
  setStatus,
  setMembers,
  showQuestion,
  setAnswered,
  setMcqStats,
  setWrittenStats,
  setLeaderboard,
  setRoomEnded,
  setConnectionError,
  resetGame,
} = gameSlice.actions;
export default gameSlice.reducer;
