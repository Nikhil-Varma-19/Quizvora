import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  subLabel?: string;
  icon?: string;
  children: ReactNode;
}

export default function Button({
  loading = false,
  loadingText = "Please wait...",
  subLabel,
  icon,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button className="btn" disabled={disabled || loading} {...rest}>
      {loading ? (
        <span className="btn__row">
          <span className="material-symbols-outlined btn__spin">sync</span>
          <span>{loadingText}</span>
        </span>
      ) : (
        <span className="btn__stack">
          <span className="btn__row">
            <span>{children}</span>
            {icon && <span className="material-symbols-outlined">{icon}</span>}
          </span>
          {subLabel && <span className="btn__sub">{subLabel}</span>}
        </span>
      )}
    </button>
  );
}
