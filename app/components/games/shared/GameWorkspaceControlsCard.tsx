import type { ReactNode } from "react";

import type { GameDifficulty } from "../../../lib/client/usecase/game-workspace/use-game-workspace";

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
    <section className="feature-card workspace-card workspace-controls-card">
      <div className="workspace-toolbar workspace-toolbar-minimal">
        <label className="field-block workspace-toolbar-field">
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
        <div className="workspace-chip-row" aria-label="Run status">
          {statusChips}
        </div>
        <div className="hero-actions compact-actions workspace-primary-actions">
          {primaryActions}
        </div>
      </div>
    </section>
  );
}
