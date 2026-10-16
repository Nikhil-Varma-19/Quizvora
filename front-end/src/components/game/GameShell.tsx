import type { ReactNode } from "react";
import NavBar from "../layout/NavBar/NavBar";
import Footer from "../layout/Footer/Footer";
import "./game.css";

interface GameShellProps {
  width?: "sm" | "md" | "lg";
  children: ReactNode;
}

/** Page frame shared by every quiz screen: navbar, centered column, footer. */
export default function GameShell({ width = "md", children }: GameShellProps) {
  return (
    <>
      <NavBar />
      <main className="shell">
        <div className={`shell__col shell__col--${width}`}>{children}</div>
      </main>
      <Footer />
    </>
  );
}
