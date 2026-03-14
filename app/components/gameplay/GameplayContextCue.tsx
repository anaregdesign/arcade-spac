import type { ReactNode } from "react";

import styles from "./GameplayContextCue.module.css";

export type GameplayContextCueTone =
  | "compare"
  | "logic"
  | "memory"
  | "review"
  | "swap"
  | "tap"
  | "target"
  | "timing"
  | "watch";

type GameplayContextCueProps = {
  align?: "center" | "start";
  className?: string;
  detail?: ReactNode;
  phase?: ReactNode;
  showDetailOnMobile?: boolean;
  title: ReactNode;
  tone?: GameplayContextCueTone;
};

function renderCueGlyph(tone: GameplayContextCueTone) {
  switch (tone) {
    case "compare":
      return "◫";
    case "logic":
      return "≈";
    case "memory":
      return "◌";
    case "review":
      return "✓";
    case "swap":
      return "↔";
    case "tap":
      return "●";
    case "timing":
      return "◔";
    case "watch":
      return "◉";
    case "target":
    default:
      return "◎";
  }
}

export function GameplayContextCue({
  align = "center",
  className,
  detail,
  phase,
  showDetailOnMobile = false,
  title,
  tone = "target",
}: GameplayContextCueProps) {
  return (
    <div
      className={[styles["context-cue"], className].filter(Boolean).join(" ")}
      data-align={align}
      data-tone={tone}
    >
      <span aria-hidden="true" className={styles["context-cue-icon"]}>
        <span className={styles["context-cue-glyph"]}>{renderCueGlyph(tone)}</span>
      </span>
      <div className={styles["context-cue-copy"]}>
        {phase ? <span className={styles["context-cue-phase"]}>{phase}</span> : null}
        <strong className={styles["context-cue-title"]}>{title}</strong>
        {detail ? (
          <p className={styles["context-cue-detail"]} data-mobile-visible={showDetailOnMobile ? "true" : "false"}>
            {detail}
          </p>
        ) : null}
      </div>
    </div>
  );
}
