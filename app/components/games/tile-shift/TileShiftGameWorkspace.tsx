import { useTileShiftWorkspace } from "../../../lib/client/usecase/game-workspace/use-tile-shift-workspace";
import { GameplayTwinPanelLayout } from "../../gameplay/GameplayLayoutVariants";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./TileShiftGameWorkspace.module.css";

function Board({ board }: { board: string[][] }) {
  return (
    <div className={styles["shift-board"]} style={{ gridTemplateColumns: `repeat(${board[0]?.length ?? 1}, minmax(0, 1fr))` }}>
      {board.flatMap((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <span aria-hidden="true" className={styles["shift-cell"]} key={`shift-cell-${rowIndex}-${columnIndex}`}>
            {value}
          </span>
        )),
      )}
    </div>
  );
}

export function TileShiftGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useTileShiftWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Moves {screen.tileShift.moveCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["shift-workspace-card"]].join(" ")} aria-label="Tile Shift board">
        <div className={[styles["shift-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayTwinPanelLayout className={styles["shift-columns"]}>
            <div className={styles["shift-panel"]}>
              <p className="eyebrow">Target</p>
              <Board board={screen.tileShift.targetBoard} />
            </div>
            <div className={styles["shift-panel"]}>
              <p className="eyebrow">Live</p>
              <div className={styles["shift-controls-top"]}>
                {Array.from({ length: screen.tileShift.columnCount }, (_, columnIndex) => (
                  <button
                    className={styles["shift-control"]}
                    key={`shift-column-${columnIndex}`}
                    onClick={() => screen.handleColumnShift(columnIndex)}
                    type="button"
                  >
                    ↓
                  </button>
                ))}
              </div>
              <div className={styles["shift-live-row"]}>
                <div className={styles["shift-controls-side"]}>
                  {Array.from({ length: screen.tileShift.rowCount }, (_, rowIndex) => (
                    <button
                      className={styles["shift-control"]}
                      key={`shift-row-${rowIndex}`}
                      onClick={() => screen.handleRowShift(rowIndex)}
                      type="button"
                    >
                      →
                    </button>
                  ))}
                </div>
                <Board board={screen.tileShift.liveBoard} />
              </div>
            </div>
          </GameplayTwinPanelLayout>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Shift rows to the right and columns downward until the live board matches the target."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Shift ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
