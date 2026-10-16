import type { HTMLAttributes } from "react";
import "./Card.css";

export default function Card({
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`.trim()} {...rest} />;
}
