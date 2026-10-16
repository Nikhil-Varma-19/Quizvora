import "./game.css";

export default function RoomCodeBadge({ code }: { code: string }) {
  return (
    <div className="room-code">
      <span className="room-code__label">Room code</span>
      <span className="room-code__value">{code}</span>
    </div>
  );
}
