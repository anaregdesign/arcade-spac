import { useMinesweeperWorkspace } from "../../../lib/client/usecase/game-workspace/use-minesweeper-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./minesweeper-game-workspace.module.css";

export function MinesweeperGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useMinesweeperWorkspace(workspace);

  return (
    <>
      <GameWorkspaceControlsCard
        difficulty={workspace.difficulty}
        isDifficultyDisabled={screen.isLiveRun}
        onDifficultyChange={workspace.changeDifficulty}
        primaryActions={(
          <>
            <button
              aria-pressed={screen.isFlagModeEnabled}
              className={screen.isFlagModeEnabled ? "action-link action-link-primary" : "action-link action-link-secondary"}
              disabled={!screen.isLiveRun}
              type="button"
              onClick={screen.handleFlagModeToggle}
            >
              {screen.isFlagModeEnabled ? "Flag mode on" : "Flag mode off"}
            </button>
            <GameInstructionsDialog instructions={instructions} />
          </>
        )}
        statusChips={(
          <>
            <span className="status-badge status-badge-neutral">{screen.runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">Time {screen.timeLabel}</span>
            <span className="status-badge status-badge-neutral">
              Flags {screen.minesweeper.flaggedCount}/{screen.minesweeper.totalMines}
            </span>
            <span className="status-badge status-badge-neutral">Mistakes {screen.minesweeper.mistakeCount}</span>
            <span className="status-badge status-badge-neutral">Tap {screen.isFlagModeEnabled ? "Flag" : "Open"}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"]].join(" ")} aria-label="Minesweeper board">
        <div className={sharedStyles["game-board-overlay-shell"]}>
          <div className={styles["minesweeper-shell"]}>
            {screen.minesweeper.board.map((row, rowIndex) => (
              <div className={styles["minesweeper-row"]} key={`row-${rowIndex}`}>
                {row.map((cell, columnIndex) => (
                  <button
                    aria-label={`Cell ${rowIndex + 1}-${columnIndex + 1}`}
                    className={[
                      styles["mine-cell"],
                      cell.isRevealed ? styles["mine-cell-revealed"] : "",
                      cell.isFlagged ? styles["mine-cell-flagged"] : "",
                      cell.isExploded ? styles["mine-cell-exploded"] : "",
                      cell.isRevealed && cell.adjacentMines > 0 ? styles[`mine-cell-value-${cell.adjacentMines}`] : "",
                    ].filter(Boolean).join(" ")}
                    key={`cell-${rowIndex}-${columnIndex}`}
                    onClick={() => screen.handleCellClick(rowIndex, columnIndex)}
                    onContextMenu={(event) => screen.handleCellContextMenu(event, rowIndex, columnIndex)}
                    type="button"
                  >
                    {cell.isFlagged
                      ? "!"
                      : cell.isExploded
                        ? "X"
                        : cell.isRevealed && cell.hasMine
                          ? "*"
                          : cell.isRevealed && cell.adjacentMines > 0
                            ? cell.adjacentMines
                            : ""}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Press Start run, or open any cell to begin this board."
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
