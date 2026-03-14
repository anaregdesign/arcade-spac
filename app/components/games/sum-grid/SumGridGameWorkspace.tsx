import { useSumGridWorkspace } from "../../../lib/client/usecase/game-workspace/use-sum-grid-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./SumGridGameWorkspace.module.css";

export function SumGridGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useSumGridWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Grid {Math.min(screen.sumGrid.puzzleIndex + 1, screen.sumGrid.puzzleCount)}/{screen.sumGrid.puzzleCount}</span>
            <span className="status-badge status-badge-neutral">Resets {screen.sumGrid.wrongGridCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["sum-grid-board-card"]].join(" ")} aria-label="Sum Grid board">
        <div className={[styles["sum-grid-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["sum-grid-stage"]}>
            <div className={styles["sum-grid-column-sums"]} style={{ gridTemplateColumns: `repeat(${screen.sumGrid.puzzle.columnCount}, minmax(0, 1fr))` }}>
              {screen.sumGrid.puzzle.columnSums.map((value, index) => (
                <span className={styles["sum-grid-sum-chip"]} key={`column-sum-${index}`}>{value}</span>
              ))}
            </div>
            <div className={styles["sum-grid-main"]}>
              <div className={styles["sum-grid-row-sums"]}>
                {screen.sumGrid.puzzle.rowSums.map((value, index) => (
                  <span className={styles["sum-grid-sum-chip"]} key={`row-sum-${index}`}>{value}</span>
                ))}
              </div>
              <div className={styles["sum-grid-board"]} style={{ gridTemplateColumns: `repeat(${screen.sumGrid.puzzle.columnCount}, minmax(0, 1fr))` }}>
                {screen.sumGrid.puzzle.currentGrid.flatMap((row, rowIndex) =>
                  row.map((value, columnIndex) => (
                    <button
                      aria-label={`Sum Grid cell ${rowIndex + 1}-${columnIndex + 1}`}
                      className={styles["sum-grid-cell"]}
                      disabled={!screen.isLiveRun}
                      key={`sum-grid-cell-${rowIndex}-${columnIndex}`}
                      onClick={() => screen.handleCellPress(rowIndex, columnIndex)}
                      type="button"
                    >
                      {value ?? "?"}
                    </button>
                  )),
                )}
              </div>
            </div>
            <div className={styles["sum-grid-bank"]}>
              {screen.sumGrid.puzzle.availableNumbers.map((value, index) => (
                <button
                  className={[styles["sum-grid-bank-button"], screen.sumGrid.selectedNumber === value ? styles["sum-grid-bank-button-selected"] : ""].filter(Boolean).join(" ")}
                  disabled={!screen.isLiveRun}
                  key={`sum-grid-bank-${value}-${index}`}
                  onClick={() => screen.handleNumberPress(value)}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Select a candidate number, place it into the grid, and satisfy every row and column sum before time runs out."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Grid ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
