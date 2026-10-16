import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import NavBar from "../../components/layout/NavBar/NavBar";
import Footer from "../../components/layout/Footer/Footer";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import { createGuestSession } from "../../lib/api";
import { readGuest, saveGuest } from "../../lib/auth";
import type { GuestIdentity } from "../../lib/auth";
import { emitWithAck, ensureConnected, resetSocket } from "../../lib/socket";
import { useAppDispatch, useAppSelector } from "../../store";
import { setRoom } from "../../store/gameSlice";
import type { RoomJoinAck } from "../../types/game";
import "./Join.css";

export default function Join() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [searchParams] = useSearchParams();
  const hostIntent = searchParams.get("host") === "1";

  const [guest, setGuest] = useState<GuestIdentity | null>(readGuest);
  const [name, setName] = useState("");
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // A registered user joins as themselves; everyone else needs a guest profile first.
  const needsName = !user && !guest;
  const playerName = user?.name ?? guest?.name;

  // Host intent with an identity already in place skips straight to creating a quiz.
  if (hostIntent && !needsName) return <Navigate to="/host" replace />;

  async function handleCreateGuest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await createGuestSession({ name: name.trim() });
      saveGuest(data);
      resetSocket();
      setGuest(data);
      if (hostIntent) navigate("/host");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create your guest profile.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await ensureConnected();
      const roomCode = code.trim();
      const ack = await emitWithAck<{ code: string }, RoomJoinAck>("room:join", {
        code: roomCode,
      });

      if (!ack.success || !ack.data) {
        setError(ack.message || "Could not join that room.");
        return;
      }

      dispatch(
        setRoom({
          roomId: ack.data.roomId,
          code: roomCode,
          status: ack.data.status,
          isHost: false,
        }),
      );

      if (ack.data.status === "ended") navigate("/results");
      else if (ack.data.status === "running") navigate("/play");
      else navigate("/lobby");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join that room.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="join">
        <div className="join__card">
          <span className="join__icon material-symbols-outlined">
            {needsName ? "sentiment_satisfied" : "pin"}
          </span>

          {needsName ? (
            <>
              <h1 className="join__title">What&apos;s your name?</h1>
              <p className="join__text">
                This is how other players will see you on the leaderboard.
              </p>
              <form className="auth-form join__form" onSubmit={handleCreateGuest}>
                <TextField
                  label="Display name"
                  icon="person"
                  placeholder="3-20 characters"
                  required
                  minLength={3}
                  maxLength={20}
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {error && <Alert message={error} />}
                <Button
                  type="submit"
                  icon="arrow_forward"
                  loading={loading}
                  loadingText="Creating profile..."
                >
                  Continue
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="join__title">Enter the room code</h1>
              <p className="join__text">
                Playing as <strong>{playerName}</strong>. Ask the host for the
                code on their screen.
              </p>
              <form className="auth-form join__form" onSubmit={handleJoin}>
                <input
                  className="join__code"
                  aria-label="Room code"
                  placeholder="ROOM CODE"
                  required
                  autoFocus
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                {error && <Alert message={error} />}
                <Button
                  type="submit"
                  icon="arrow_forward"
                  loading={loading}
                  loadingText="Joining..."
                >
                  Join quiz
                </Button>
              </form>
            </>
          )}

          {!user && (
            <p className="join__foot">
              Hosting instead? <Link to="/login">Log in here</Link>
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
