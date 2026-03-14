import { useColorSweepWorkspace } from "../../../lib/client/usecase/game-workspace/use-color-sweep-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplayDirectBoardLayout } from "../../gameplay/layouts/GameplayDirectBoardLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./ColorSweepGameWorkspace.module.css";
export function ColorSweepGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useColorSweepWorkspace(workspace);

  return (
    <>
      <GameWorkspaceControlsCard
        difficulty={workspace.difficulty}
        isDifficultyDisabled={screen.isLiveRun}
        onDifficultyChange={workspace.changeDifficulty}
        primaryActions={(
          <GameInstructionsDialog instructions={instructions} />
        )}
        statusChips={(
          <>
            <span className="status-badge status-badge-neutral">{screen.runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">Target {screen.targetColorLabel}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
            <span className="status-badge status-badge-neutral">
              Tiles {screen.colorSweep.targetCount - screen.colorSweep.remainingTargetCount}/{screen.colorSweep.targetCount}
            </span>
            <span className="status-badge status-badge-neutral">Wrong taps {screen.colorSweep.wrongTapCount}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"], styles["color-sweep-board-card"]].join(" ")} aria-label="Color Sweep board">
        <div className={[styles["color-sweep-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayDirectBoardLayout>
          <GameplayContextCue
            className={styles["color-sweep-copy"]}
            detail={`Target ${screen.targetColorLabel}.`}
            phase={screen.isLiveRun ? "Sweep" : "Ready"}
            title="Clear only the target color"
            tone="target"
          />
          <div className={styles["color-sweep-panel"]}>
            <div className={styles["color-sweep-legend"]}>
              <strong className={styles["color-sweep-legend-label"]}>{screen.targetColorLabel}</strong>
              <span
                aria-hidden="true"
                className={[styles["color-sweep-swatch"], styles[`color-sweep-swatch-${screen.colorSweep.targetColorKey}`]].join(" ")}
              />
            </div>
            <div
              className={styles["color-sweep-grid"]}
              style={{ gridTemplateColumns: `repeat(${screen.colorSweep.columns}, minmax(0, 1fr))` }}
            >
              {screen.colorSweep.board.flatMap((row, rowIndex) =>
                row.map((cell, columnIndex) => (
                  <button
                    aria-label={`Color tile ${rowIndex + 1}-${columnIndex + 1}`}
                    className={[
                      styles["color-sweep-tile"],
                      styles[`color-sweep-tile-${cell.colorKey}`],
                      cell.isCleared ? styles["color-sweep-tile-cleared"] : "",
                    ].filter(Boolean).join(" ")}
                    key={cell.id}
                    onClick={() => screen.handleTilePress(rowIndex, columnIndex)}
                    type="button"
                  >
                    <span className={styles["color-sweep-tile-core"]} />
                  </button>
                )),
              )}
            </div>
          </div>
          </GameplayDirectBoardLayout>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Tap only the target color tiles."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard
        detail={screen.finishDetail}
        emphasis={screen.saveStatusLabel}
      />
    </>
  );
}
