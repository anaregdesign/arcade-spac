import { usePathRecallWorkspace } from "../../../lib/client/usecase/game-workspace/use-path-recall-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplayDirectBoardLayout } from "../../gameplay/layouts/GameplayDirectBoardLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./PathRecallGameWorkspace.module.css";

export function PathRecallGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = usePathRecallWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Path {screen.pathRecall.inputStep}/{screen.pathRecall.path.length}</span>
            <span className="status-badge status-badge-neutral">Wrong cells {screen.pathRecall.wrongCellCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["recall-board-card"]].join(" ")} aria-label="Path Recall board">
        <div className={[styles["recall-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayDirectBoardLayout>
          <GameplayContextCue
            className={styles["recall-copy"]}
            detail="Replay the same cells in the same order."
            phase={screen.isLiveRun ? "Recall" : "Ready"}
            title="Watch the path, then repeat it"
            tone="memory"
          />
          <div
            className={styles["recall-grid"]}
            style={{ gridTemplateColumns: `repeat(${screen.pathRecall.columnCount}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: screen.pathRecall.rowCount * screen.pathRecall.columnCount }, (_, index) => {
              const rowIndex = Math.floor(index / screen.pathRecall.columnCount);
              const columnIndex = index % screen.pathRecall.columnCount;
              const pathIndex = screen.pathRecall.path.findIndex((cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex);
              const isFlashing = pathIndex !== -1 && screen.pathRecall.flashingStepIndex === pathIndex;
              const isRecalled = pathIndex !== -1 && pathIndex < screen.pathRecall.inputStep;

              return (
                <button
                  aria-label={`Recall cell ${rowIndex + 1}-${columnIndex + 1}`}
                  className={[
                    styles["recall-cell"],
                    isFlashing ? styles["recall-cell-flashing"] : "",
                    isRecalled ? styles["recall-cell-recalled"] : "",
                  ].filter(Boolean).join(" ")}
                  key={`path-recall-${index}`}
                  onClick={() => screen.handleCellPress(rowIndex, columnIndex)}
                  type="button"
                >
                  <span className={styles["recall-cell-core"]}>{isRecalled ? pathIndex + 1 : ""}</span>
                </button>
              );
            })}
          </div>
          </GameplayDirectBoardLayout>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Watch, then replay the path."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Path ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
