import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import GameShell from "../../components/game/GameShell";
import QuestionBuilder from "../../components/game/QuestionBuilder";
import Card from "../../components/ui/Card/Card";
import TextField from "../../components/ui/TextField/TextField";
import SelectField from "../../components/ui/SelectField/SelectField";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import { bulkCreateQuestions } from "../../lib/api";
import { readGuest } from "../../lib/auth";
import { emitWithAck, ensureConnected } from "../../lib/socket";
import { useAppDispatch, useAppSelector } from "../../store";
import { resetGame, setRoom } from "../../store/gameSlice";
import type {
  BulkQuestionCreatePayload,
  ModePlay,
  ResultMode,
  RoomCreatePayload,
  RoomCreateResponse,
} from "../../types/game";

export default function HostDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { roomId, mode, isHost, title: roomTitle, resultMode: roomResultMode } =
    useAppSelector((s) => s.game);
  // Set when the host comes back from the question builder to change the basics.
  const prefill = useLocation().state as {
    title: string;
    mode: ModePlay;
    resultMode: ResultMode;
  } | null;

  const [title, setTitle] = useState(prefill?.title ?? "");
  const [selectedMode, setSelectedMode] = useState<ModePlay>(prefill?.mode ?? "predefined");
  const [resultMode, setResultMode] = useState<ResultMode>(prefill?.resultMode ?? "perQuestion");
  const [goingBack, setGoingBack] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!user && !readGuest()) return <Navigate to="/join?host=1" replace />;

  // A room this host already created (e.g. they refreshed mid-setup).
  const hasRoom = roomId !== null && isHost;
  if (hasRoom && mode === "live") return <Navigate to="/lobby" replace />;

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      await ensureConnected();
      const ack = await emitWithAck<RoomCreatePayload, RoomCreateResponse>(
        "room:create",
        { title: title.trim(), mode: selectedMode, resultMode },
      );
      if (!ack.success || !ack.data) {
        setError(ack.message || "Could not create the room.");
        return;
      }
      dispatch(
        setRoom({
          roomId: ack.data._id,
          code: ack.data.code,
          title: ack.data.title,
          mode: selectedMode, // the backend never echoes `mode` back
          resultMode: ack.data.resultMode,
          status: ack.data.status,
          isHost: true,
        }),
      );
      if (selectedMode === "live") navigate("/lobby");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the room.");
    } finally {
      setCreating(false);
    }
  }

  // The room already exists on the server, so going back ends that draft room
  // and returns to the form with the same values to edit.
  async function handleBack() {
    setGoingBack(true);
    const values = {
      title: roomTitle ?? title,
      mode: "predefined" as ModePlay,
      resultMode: roomResultMode ?? resultMode,
    };
    try {
      await emitWithAck("room:end", { roomId });
    } catch {
      // Best effort - the draft room is abandoned either way.
    }
    dispatch(resetGame());
    navigate("/host", { replace: true, state: values });
  }

  async function handleSaveQuestions(payload: BulkQuestionCreatePayload) {
    if (!roomId) return;
    setSaveError(null);
    setSaving(true);
    try {
      await bulkCreateQuestions(roomId, payload);
      navigate("/lobby");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save the questions.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GameShell width={hasRoom ? "lg" : "sm"}>
      {!hasRoom ? (
        <Card>
          <div className="page-head">
            <span className="page-head__icon material-symbols-outlined">rocket_launch</span>
            <h1 className="page-title">Create a new quiz room</h1>
            <p className="muted">
              Set the basics now - you will get a shareable room code right after.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleCreate}>
            <TextField
              label="Quiz title"
              icon="quiz"
              placeholder="Friday trivia night"
              required
              minLength={3}
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <SelectField
              label="Mode"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value as ModePlay)}
            >
              <option value="predefined">Predefined - author all questions upfront</option>
              <option value="live">Live - author questions on the fly</option>
            </SelectField>
            <SelectField
              label="Show results"
              value={resultMode}
              onChange={(e) => setResultMode(e.target.value as ResultMode)}
            >
              <option value="perQuestion">After every question</option>
              <option value="atLast">Only at the end</option>
            </SelectField>
            {error && <Alert message={error} />}
            <Button
              type="submit"
              icon="arrow_forward"
              loading={creating}
              loadingText="Creating room..."
            >
              Create room
            </Button>
          </form>
        </Card>
      ) : (
        <>
          <div className="row">
            <Button
              variant="ghost"
              size="sm"
              block={false}
              icon="arrow_back"
              loading={goingBack}
              loadingText="Going back..."
              onClick={handleBack}
            >
              Back to quiz details
            </Button>
          </div>
          <div className="page-head">
            <h1 className="page-title">Build your questions</h1>
            <p className="muted">
              Every question is locked in before the quiz starts in predefined mode.
            </p>
          </div>
          <QuestionBuilder
            onSubmit={handleSaveQuestions}
            isSubmitting={saving}
            submitError={saveError}
          />
        </>
      )}
    </GameShell>
  );
}
