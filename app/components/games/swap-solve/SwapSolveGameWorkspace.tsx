import { useSwapSolveWorkspace } from "../../../lib/client/usecase/game-workspace/use-swap-solve-workspace";
import { GameplayTwinPanelLayout } from "../../gameplay/GameplayLayoutVariants";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./SwapSolveGameWorkspace.module.css";

function StaticBoard({ board }: { board: string[][] }) {
  return (
    <div className={styles["swap-board"]} style={{ gridTemplateColumns: `repeat(${board[0]?.length ?? 1}, minmax(0, 1fr))` }}>
      {board.flatMap((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <span aria-hidden="true" className={styles["swap-cell"]} key={`swap-target-${rowIndex}-${columnIndex}`}>
            {value}
          </span>
        )),
      )}
    </div>
  );
}

export function SwapSolveGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useSwapSolveWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Swaps {screen.swapSolve.swapCount}/{screen.swapSolve.swapBudget}</span>
            <span className="status-badge status-badge-neutral">Mismatch {screen.swapSolve.mismatchCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["swap-workspace-card"]].join(" ")} aria-label="Swap Solve board">
        <div className={[styles["swap-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayTwinPanelLayout className={styles["swap-columns"]}>
            <div className={styles["swap-panel"]}>
              <p className="eyebrow">Target</p>
              <StaticBoard board={screen.swapSolve.targetBoard} />
            </div>
            <div className={styles["swap-panel"]}>
              <p className="eyebrow">Live</p>
              <div className={styles["swap-board"]} style={{ gridTemplateColumns: `repeat(${screen.swapSolve.columnCount}, minmax(0, 1fr))` }}>
                {screen.swapSolve.liveBoard.flatMap((row, rowIndex) =>
                  row.map((value, columnIndex) => {
                    const isSelected =
                      screen.swapSolve.selectedCell?.rowIndex === rowIndex && screen.swapSolve.selectedCell?.columnIndex === columnIndex;

                    return (
                      <button
                        aria-label={`Swap tile ${rowIndex + 1}-${columnIndex + 1}`}
                        className={[styles["swap-cell"], isSelected ? styles["swap-cell-selected"] : ""].filter(Boolean).join(" ")}
                        disabled={!screen.isLiveRun}
                        key={`swap-live-${rowIndex}-${columnIndex}`}
                        onClick={() => screen.handleCellPress(rowIndex, columnIndex)}
                        type="button"
                      >
                        {value}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>
          </GameplayTwinPanelLayout>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Tap one tile, tap another tile, and swap them until the live board matches the target before the budget runs out."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Swap ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
