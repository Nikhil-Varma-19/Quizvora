import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import "./TextField.css";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: string;
  error?: string;
}

export default function TextField({
  label,
  icon,
  error,
  type = "text",
  ...rest
}: TextFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control">
        <span className="material-symbols-outlined field__icon">{icon}</span>
        <input
          id={id}
          className={`field__input${isPassword ? " field__input--has-toggle" : ""}${error ? " field__input--error" : ""}`}
          type={isPassword && visible ? "text" : type}
          aria-invalid={!!error}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            aria-label="Toggle password visibility"
            onClick={() => setVisible((v) => !v)}
          >
            <span className="material-symbols-outlined">
              {visible ? "visibility_off" : "visibility"}
            </span>
          </button>
        )}
      </div>
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}
