import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import type { Socket } from "socket.io-client";
import ConnectionBanner from "../components/game/ConnectionBanner";
import { clearAuth, readAuth } from "../lib/auth";
import { connectSocket, setSocketBinder } from "../lib/socket";
import { store } from "../store";
import { logout } from "../store/authSlice";
import {
  setConnectionError,
  setLeaderboard,
  setMcqStats,
  resetGame,
  setMembers,
  setRoomEnded,
  setStatus,
  setWrittenStats,
  showQuestion,
} from "../store/gameSlice";
import type { Question, QuestionStats, RoomMember } from "../types/game";

/**
 * Root layout that owns every server -> client socket listener. It sits
 * above all routes because the backend can replay `quiz:started` /
 * `question:show` right after a reconnect, and a refresh mid-quiz must
 * still land on the right screen.
 */
export default function SocketProvider() {
  const navigate = useNavigate();

  useEffect(() => {
    const { dispatch, getState } = store;

    const goToRunningScreen = () =>
      navigate(getState().game.isHost ? "/host-console" : "/play");

    function bind(socket: Socket) {
      socket.on("connect", () => dispatch(setConnectionError(null)));
      socket.on("connect_error", (err: Error) => {
        // The server rejected our identity (expired guest session, deleted
        // account...): drop it and send the user to sign in again.
        if (err.message === "Authentication failed") {
          const wasUser = !!readAuth();
          clearAuth();
          dispatch(logout()); // also resets the socket
          dispatch(resetGame());
          dispatch(setConnectionError(null));
          navigate(wasUser ? "/login" : "/join", {
            replace: true,
            state: { notice: "Your session expired. Please sign in again." },
          });
          return;
        }
        dispatch(setConnectionError(err.message || "Could not connect to the server."));
      });
      socket.on("disconnect", (reason: string) => {
        if (reason === "io client disconnect") return;
        dispatch(setConnectionError("Disconnected from the server. Trying to reconnect…"));
      });
      socket.on("player:list:update", (members: RoomMember[]) =>
        dispatch(setMembers(members)),
      );
      socket.on("quiz:started", () => {
        dispatch(setStatus("running"));
        goToRunningScreen();
      });
      socket.on("question:show", (p: { question: Question }) => {
        dispatch(showQuestion(p.question));
        goToRunningScreen();
      });
      socket.on("question:stats", (stats: QuestionStats) =>
        dispatch(stats.type === "mcq" ? setMcqStats(stats) : setWrittenStats(stats)),
      );
      socket.on("quiz:ended", (p: { leaderboard: RoomMember[]; message: string }) => {
        dispatch(setLeaderboard(p));
        navigate("/results");
      });
      socket.on("room:ended", (p: { message: string; leaderboard?: RoomMember[] }) => {
        if (p.leaderboard) dispatch(setLeaderboard({ leaderboard: p.leaderboard, message: p.message }));
        else dispatch(setRoomEnded(p.message));
        navigate("/results");
      });
    }

    setSocketBinder(bind);

    // After a refresh mid-room, reconnect so the backend re-attaches this identity.
    if (getState().game.roomId) connectSocket();

    return () => setSocketBinder(null);
  }, [navigate]);

  return (
    <>
      <ConnectionBanner />
      <Outlet />
    </>
  );
}
