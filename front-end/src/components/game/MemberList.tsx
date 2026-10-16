import type { RoomMember } from "../../types/game";
import "./game.css";

export default function MemberList({ members }: { members: RoomMember[] }) {
  if (members.length === 0) {
    return <p className="muted center">Waiting for players to join…</p>;
  }

  return (
    <div className="members">
      {members.map((m, idx) => (
        // The backend strips ids from this payload - key by position + name.
        <span className="members__chip" key={`${idx}-${m.participantId?.name}`}>
          <span
            className={`material-symbols-outlined members__icon${m.role === "admin" ? " members__icon--admin" : ""}`}
          >
            {m.role === "admin" ? "workspace_premium" : "person"}
          </span>
          {m.participantId?.name ?? "Unknown"}
        </span>
      ))}
    </div>
  );
}
