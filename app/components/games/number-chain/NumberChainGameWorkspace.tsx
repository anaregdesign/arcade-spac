import { useNumberChainWorkspace } from "../../../lib/client/usecase/game-workspace/use-number-chain-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./NumberChainGameWorkspace.module.css";

export function NumberChainGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useNumberChainWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Next {screen.numberChain.nextNumber}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
            <span className="status-badge status-badge-neutral">
              Cleared {screen.numberChain.totalCount - screen.numberChain.remainingCount}/{screen.numberChain.totalCount}
            </span>
            <span className="status-badge status-badge-neutral">Wrong taps {screen.numberChain.wrongTapCount}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"], styles["number-chain-board-card"]].join(" ")} aria-label="Number Chain board">
        <div className={[styles["number-chain-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayContextCue
            className={styles["number-chain-copy"]}
            detail={`Next ${screen.numberChain.nextNumber}.`}
            phase={screen.isLiveRun ? "Tap" : "Ready"}
            title="Tap the numbers in ascending order"
            tone="target"
          />
          <div className={styles["number-chain-panel"]}>
            <div
              className={styles["number-chain-grid"]}
              style={{ gridTemplateColumns: `repeat(${screen.numberChain.columns}, minmax(0, 1fr))` }}
            >
              {screen.numberChain.board.flatMap((row, rowIndex) =>
                row.map((cell, columnIndex) => (
                  <button
                    aria-label={`Number ${cell.value}`}
                    className={[
                      styles["number-chain-tile"],
                      cell.isCleared ? styles["number-chain-tile-cleared"] : "",
                      screen.isLiveRun && cell.value === screen.numberChain.nextNumber ? styles["number-chain-tile-next"] : "",
                    ].filter(Boolean).join(" ")}
                    key={cell.id}
                    onClick={() => screen.handleTilePress(rowIndex, columnIndex)}
                    type="button"
                  >
                    {cell.isCleared ? "" : cell.value}
                  </button>
                )),
              )}
            </div>
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Tap the numbers in ascending order."
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
