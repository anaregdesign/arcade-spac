import type { ReactNode } from "react";

import type { GameDifficulty } from "../../../lib/client/usecase/game-workspace/use-game-workspace";
import styles from "./GameWorkspaceShared.module.css";

const difficultyOptions: Array<{ label: string; value: GameDifficulty }> = [
  { label: "Easy", value: "EASY" },
  { label: "Normal", value: "NORMAL" },
  { label: "Hard", value: "HARD" },
  { label: "Expert", value: "EXPERT" },
];

type GameWorkspaceControlsCardProps = {
  difficulty: GameDifficulty;
  isDifficultyDisabled: boolean;
  onDifficultyChange: (nextDifficulty: GameDifficulty) => void;
  primaryActions: ReactNode;
  statusChips: ReactNode;
};

export function GameWorkspaceControlsCard({
  difficulty,
  isDifficultyDisabled,
  onDifficultyChange,
  primaryActions,
  statusChips,
}: GameWorkspaceControlsCardProps) {
  return (
    <section className={["feature-card", styles["workspace-card"], styles["workspace-controls-card"]].join(" ")}>
      <div className={[styles["workspace-toolbar"], styles["workspace-toolbar-minimal"]].join(" ")}>
        <label className={["field-block", styles["workspace-toolbar-field"]].join(" ")}>
          <span className="field-label">Difficulty</span>
          <select
            className="field-select"
            value={difficulty}
            disabled={isDifficultyDisabled}
            onChange={(event) => onDifficultyChange(event.currentTarget.value as GameDifficulty)}
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className={styles["workspace-chip-row"]} aria-label="Run status">
          {statusChips}
        </div>
        <div className={["hero-actions", "compact-actions", styles["workspace-primary-actions"]].join(" ")}>
          {primaryActions}
        </div>
      </div>
    </section>
  );
}
