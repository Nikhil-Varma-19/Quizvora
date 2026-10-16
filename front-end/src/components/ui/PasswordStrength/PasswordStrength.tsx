import "./PasswordStrength.css";

const LEVELS = ["", "Weak", "Fair", "Good", "Strong"];

function getChecks(value: string) {
  return {
    length: value.length >= 6 && value.length <= 20,
    number: /[0-9]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
    upper: /[A-Z]/.test(value),
  };
}

export default function PasswordStrength({ value }: { value: string }) {
  const checks = getChecks(value);
  const score = value ? Object.values(checks).filter(Boolean).length : 0;

  const chips = [
    { label: "6-20 chars", ok: checks.length },
    { label: "Number", ok: checks.number },
    { label: "Symbol", ok: checks.symbol },
  ];

  return (
    <div className="strength">
      <span className={`strength__label strength__label--${score}`}>
        {value ? LEVELS[score] || "Weak" : "Enter password"}
      </span>
      <div className="strength__bars">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`strength__bar${n <= score ? ` strength__bar--${score}` : ""}`}
          />
        ))}
      </div>
      <div className="strength__chips">
        {chips.map((c) => (
          <span
            key={c.label}
            className={`strength__chip${c.ok ? " strength__chip--ok" : ""}`}
          >
            <span className="material-symbols-outlined">check</span>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
