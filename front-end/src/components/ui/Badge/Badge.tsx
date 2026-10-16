import type { ReactNode } from "react";
import "./Badge.css";

interface BadgeProps {
  tone?: "neutral" | "brand" | "warning";
  children: ReactNode;
}

export default function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
