import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "../ui/Button/Button";
import ConfirmModal from "../ui/ConfirmModal/ConfirmModal";
import { emitWithAck } from "../../lib/socket";
import { store, useAppDispatch, useAppSelector } from "../../store";
import { resetGame, setRoomEnded } from "../../store/gameSlice";

/**
 * Leave (member) or end (host) the current room, with a confirmation.
 * A member's leave is removed from the room and sent home. When the host
 * ends the room, the server's `room:ended` event moves everyone to results.
 */
export default function LeaveRoomButton() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { roomId, isHost } = useAppSelector((s) => s.game);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      if (isHost) {
        const ack = await emitWithAck("room:end", { roomId });
        // `room:ended` normally moves everyone to the results; make sure the host gets there too.
        if (ack.success && store.getState().game.status !== "ended") {
          dispatch(setRoomEnded("Room ended by host"));
          navigate("/results");
        }
      } else await emitWithAck("room:leave", {});
    } catch {
      // Best effort - never leave the user stuck in a dead room.
    }
    setBusy(false);
    setOpen(false);
    if (!isHost) {
      dispatch(resetGame());
      navigate("/");
    }
  }

  return (
    <>
      <Button
        variant={isHost ? "danger" : "secondary"}
        size="sm"
        block={false}
        icon={isHost ? "power_settings_new" : "logout"}
        onClick={() => setOpen(true)}
      >
        {isHost ? "End room" : "Leave room"}
      </Button>
      {open && (
        <ConfirmModal
          danger
          title={isHost ? "End this room for everyone?" : "Leave this room?"}
          message={
            isHost
              ? "The quiz stops and every player is taken to the results."
              : "You will be removed from the quiz."
          }
          confirmLabel={isHost ? "End room" : "Leave"}
          loading={busy}
          onConfirm={confirm}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}
