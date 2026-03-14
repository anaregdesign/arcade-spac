import { useSudokuWorkspace } from "../../../lib/client/usecase/game-workspace/use-sudoku-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./sudoku-game-workspace.module.css";

export function SudokuGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useSudokuWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">{screen.isRunCleared ? "Solved" : screen.isLiveRun ? "Live" : "Ready"}</span>
            <span className="status-badge status-badge-neutral">Time {screen.timeLabel}</span>
            <span className="status-badge status-badge-neutral">Open {screen.sudoku.remainingCellCount}</span>
            <span className="status-badge status-badge-neutral">Mistakes {screen.sudoku.mistakeCount}</span>
            <span className="status-badge status-badge-neutral">Hints {screen.sudoku.hintCount}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"]].join(" ")} aria-label="Sudoku board">
        <div className={sharedStyles["game-board-overlay-shell"]}>
          <div className={styles["sudoku-shell"]}>
            <div className={styles["sudoku-board"]} role="grid" aria-label="Sudoku board">
              {screen.sudoku.board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    aria-label={`Sudoku cell ${rowIndex + 1}-${colIndex + 1}`}
                    className={[
                      styles["sudoku-cell"],
                      cell.isFixed ? styles["sudoku-cell-fixed"] : "",
                      cell.isSelected ? styles["sudoku-cell-selected"] : "",
                      cell.isWrong ? styles["sudoku-cell-wrong"] : "",
                      rowIndex % 3 === 0 ? styles["sudoku-cell-top-heavy"] : "",
                      colIndex % 3 === 0 ? styles["sudoku-cell-left-heavy"] : "",
                      rowIndex === 8 ? styles["sudoku-cell-bottom-heavy"] : "",
                      colIndex === 8 ? styles["sudoku-cell-right-heavy"] : "",
                    ].filter(Boolean).join(" ")}
                    disabled={!screen.isLiveRun}
                    key={`sudoku-${rowIndex}-${colIndex}`}
                    onClick={() => screen.sudoku.selectCell(rowIndex, colIndex)}
                    type="button"
                  >
                    {cell.value > 0 ? cell.value : ""}
                  </button>
                )),
              )}
            </div>
            <div className={styles["sudoku-controls"]}>
              <div className={styles["sudoku-keypad"]} role="group" aria-label="Sudoku keypad">
                {Array.from({ length: 9 }, (_, index) => (
                  <button
                    className={styles["sudoku-key"]}
                    disabled={!screen.isLiveRun}
                    key={`digit-${index + 1}`}
                    onClick={() => screen.sudoku.applyDigit(index + 1)}
                    type="button"
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className={["hero-actions", "compact-actions", sharedStyles["workspace-utility-actions"]].join(" ")}>
                <button className="action-link action-link-secondary" disabled={!screen.isLiveRun} onClick={() => screen.sudoku.clearSelectedCell()} type="button">
                  Clear cell
                </button>
                <button className="action-link action-link-primary" disabled={!screen.isLiveRun} onClick={() => screen.sudoku.useHint()} type="button">
                  Use hint
                </button>
              </div>
            </div>
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Start the puzzle, then fill the board with the keypad or keyboard."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Puzzle ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard
        actions={screen.isLiveRun ? (
            <button className="action-link action-link-secondary" type="button" onClick={screen.handleFinishRun}>
              Finish run
            </button>
        ) : null}
        detail={screen.finishDetail}
        emphasis={screen.saveStatusLabel}
      />
    </>
  );
}
