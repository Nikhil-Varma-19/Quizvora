import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  subLabel?: string;
  icon?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "md" | "sm";
  /** Full-width by default; pass false for inline buttons. */
  block?: boolean;
  children: ReactNode;
}

export default function Button({
  loading = false,
  loadingText = "Please wait...",
  subLabel,
  icon,
  variant = "primary",
  size = "md",
  block = true,
  children,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    `btn--${variant}`,
    size === "sm" ? "btn--sm" : "",
    block ? "" : "btn--inline",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
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
