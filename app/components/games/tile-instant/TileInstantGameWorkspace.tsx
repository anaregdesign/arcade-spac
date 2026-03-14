import { useTileInstantWorkspace } from "../../../lib/client/usecase/game-workspace/use-tile-instant-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplayTwinPanelLayout } from "../../gameplay/layouts/GameplayTwinPanelLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./TileInstantGameWorkspace.module.css";

function StaticBoard({
  board,
  isHidden,
}: {
  board: string[][];
  isHidden: boolean;
}) {
  return (
    <div
      className={[styles["tile-instant-board"], isHidden ? styles["tile-instant-board-hidden"] : ""].join(" ")}
      style={{ gridTemplateColumns: `repeat(${board[0]?.length ?? 1}, minmax(0, 1fr))` }}
    >
      {board.flatMap((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <span
            aria-hidden="true"
            className={styles["tile-instant-cell"]}
            data-column={columnIndex}
            data-row={rowIndex}
            data-tile-instant-target-cell="true"
            data-value={value}
            key={`tile-instant-target-${rowIndex}-${columnIndex}`}
          >
            {isHidden ? "?" : value}
          </span>
        )),
      )}
    </div>
  );
}

export function TileInstantGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useTileInstantWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">
              Round {screen.tileInstant.currentRoundIndex + 1}/{screen.tileInstant.roundCount}
            </span>
            <span className="status-badge status-badge-neutral">Moves {screen.tileInstant.moveCount}</span>
            <span className="status-badge status-badge-neutral">
              Phase {screen.isWatching ? "Watch" : screen.isInputting ? "Rebuild" : "Ready"}
            </span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"]].join(" ")} aria-label="Tile Instant board">
        <div
          className={[styles["tile-instant-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-round={screen.tileInstant.currentRoundIndex}
          data-state={screen.tileInstant.state}
          data-tile-instant-root="true"
        >
          <GameplayContextCue
            className={styles["tile-instant-copy"]}
            detail={screen.isWatching ? "Target hides after reveal." : screen.isInputting ? "Swap any two tiles." : "Watch, then rebuild."}
            phase={screen.isWatching ? "Watch" : screen.isInputting ? "Rebuild" : "Ready"}
            title={screen.isWatching ? "Memorize the target board" : screen.isInputting ? "Swap the live board back to target" : "Watch then rebuild"}
            tone={screen.isWatching ? "memory" : "swap"}
          />

          <GameplayTwinPanelLayout className={styles["tile-instant-columns"]}>
            <article className={styles["tile-instant-panel"]}>
              <header className={styles["tile-instant-panel-header"]}>
                <p className="eyebrow">Target memory</p>
                <strong>{screen.isWatching ? "Visible now" : screen.isInputting ? "Hidden now" : "Preview board"}</strong>
              </header>
              <StaticBoard board={screen.tileInstant.targetBoard} isHidden={screen.isInputting} />
            </article>

            <article className={styles["tile-instant-panel"]}>
              <header className={styles["tile-instant-panel-header"]}>
                <p className="eyebrow">Live board</p>
                <strong>{screen.isWatching ? "Locked during watch" : "Swap any two tiles"}</strong>
              </header>
              <div
                className={styles["tile-instant-board"]}
                style={{ gridTemplateColumns: `repeat(${screen.tileInstant.columnCount}, minmax(0, 1fr))` }}
              >
                {screen.tileInstant.liveBoard.flatMap((row, rowIndex) =>
                  row.map((value, columnIndex) => {
                    const isSelected =
                      screen.tileInstant.selectedCell?.rowIndex === rowIndex && screen.tileInstant.selectedCell?.columnIndex === columnIndex;

                    return (
                      <button
                        aria-label={`Tile Instant live tile ${rowIndex + 1}-${columnIndex + 1}`}
                        className={[styles["tile-instant-cell"], isSelected ? styles["tile-instant-cell-selected"] : ""].filter(Boolean).join(" ")}
                        data-column={columnIndex}
                        data-row={rowIndex}
                        data-selected={isSelected ? "true" : "false"}
                        data-tile-instant-live-cell="true"
                        data-value={value}
                        disabled={!screen.isInputting}
                        key={`tile-instant-live-${rowIndex}-${columnIndex}`}
                        onClick={() => screen.handleCellPress(rowIndex, columnIndex)}
                        type="button"
                      >
                        {value}
                      </button>
                    );
                  }),
                )}
              </div>
            </article>
          </GameplayTwinPanelLayout>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Memorize the target board during the watch phase, then rebuild the live board by swapping any two tiles."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Flash board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
