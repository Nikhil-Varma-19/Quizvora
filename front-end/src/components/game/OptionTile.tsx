import type { ButtonHTMLAttributes } from "react";
import "./game.css";

const SHAPES = ["change_history", "diamond", "circle", "square", "star"];

interface OptionTileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  index: number;
  text: string;
  selected?: boolean;
}

export default function OptionTile({
  index,
  text,
  selected,
  disabled,
  ...rest
}: OptionTileProps) {
  const slot = index % SHAPES.length;
  return (
    <button
      type="button"
      disabled={disabled}
      className={`tile tile--${slot}${selected ? " tile--selected" : ""}`}
      {...rest}
    >
      <span className="material-symbols-outlined tile__icon">{SHAPES[slot]}</span>
      <span>{text}</span>
    </button>
  );
}
