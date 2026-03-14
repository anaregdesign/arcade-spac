import { useHiddenFindWorkspace } from "../../../lib/client/usecase/game-workspace/use-hidden-find-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./HiddenFindGameWorkspace.module.css";

export function HiddenFindGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useHiddenFindWorkspace(workspace);

  return (
    <>
      <GameWorkspaceControlsCard
        difficulty={workspace.difficulty}
        isDifficultyDisabled={screen.isLiveRun}
        onDifficultyChange={workspace.changeDifficulty}
        primaryActions={<GameInstructionsDialog instructions={instructions} />}
        statusChips={(
          <>
            <span className="status-badge status-badge-neutral">{screen.runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">Scene {Math.min(screen.hiddenFind.sceneIndex + 1, screen.hiddenFind.sceneCount)}/{screen.hiddenFind.sceneCount}</span>
            <span className="status-badge status-badge-neutral">False taps {screen.hiddenFind.falseTapCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["hidden-board-card"]].join(" ")} aria-label="Hidden Find board">
        <div className={[styles["hidden-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayContextCue
            className={styles["hidden-copy"]}
            detail={`Target ${screen.hiddenFind.currentScene.targetSymbol}.`}
            phase={screen.isLiveRun ? "Scan" : "Ready"}
            title="Find the exact motif"
            tone="target"
          />
          <div className={styles["hidden-grid"]} style={{ gridTemplateColumns: `repeat(${screen.hiddenFind.columnCount}, minmax(0, 1fr))` }}>
            {screen.hiddenFind.currentScene.board.flatMap((row, rowIndex) =>
              row.map((cell, columnIndex) => (
                <button
                  aria-label={`Hidden scene tile ${rowIndex + 1}-${columnIndex + 1}`}
                  className={styles["hidden-cell"]}
                  disabled={!screen.isLiveRun}
                  key={cell.id}
                  onClick={() => screen.handleCellPress(rowIndex, columnIndex)}
                  style={{ transform: `rotate(${cell.rotation}deg) scale(${cell.scale})` }}
                  type="button"
                >
                  {cell.symbol}
                </button>
              )),
            )}
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Find the exact motif without false taps."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Scene ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
