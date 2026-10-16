import "./Alert.css";

interface AlertProps {
  message: string;
  tone?: "error" | "success";
}

export default function Alert({ message, tone = "error" }: AlertProps) {
  return (
    <div className={`alert alert--${tone}`} role="alert">
      <span className="material-symbols-outlined">
        {tone === "error" ? "error" : "check_circle"}
      </span>
      <span>{message}</span>
    </div>
  );
}
