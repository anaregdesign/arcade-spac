import { useLightGridWorkspace } from "../../../lib/client/usecase/game-workspace/use-light-grid-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./LightGridGameWorkspace.module.css";

function GridBoard({
  board,
  columnCount,
  onCellPress,
  title,
}: {
  board: boolean[][];
  columnCount: number;
  onCellPress?: (rowIndex: number, columnIndex: number) => void;
  title: string;
}) {
  return (
    <div className={styles["grid-panel"]}>
      <p className="eyebrow">{title}</p>
      <div className={styles["grid-board"]} style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
        {board.flatMap((row, rowIndex) =>
          row.map((isLit, columnIndex) => {
            const className = [styles["grid-cell"], isLit ? styles["grid-cell-lit"] : ""].filter(Boolean).join(" ");

            return onCellPress ? (
              <button
                aria-label={`${title} cell ${rowIndex + 1}-${columnIndex + 1}`}
                className={className}
                key={`${title}-${rowIndex}-${columnIndex}`}
                onClick={() => onCellPress(rowIndex, columnIndex)}
                type="button"
              />
            ) : (
              <span aria-hidden="true" className={className} key={`${title}-${rowIndex}-${columnIndex}`} />
            );
          }),
        )}
      </div>
    </div>
  );
}

export function LightGridGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useLightGridWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Moves {screen.lightGrid.moveCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["grid-workspace-card"]].join(" ")} aria-label="Light Grid board">
        <div className={[styles["grid-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["grid-columns"]}>
            <GridBoard board={screen.lightGrid.targetGrid} columnCount={screen.lightGrid.columnCount} title="Target" />
            <GridBoard board={screen.lightGrid.liveGrid} columnCount={screen.lightGrid.columnCount} onCellPress={screen.handleCellPress} title="Live" />
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Tap a live cell to flip it and its orthogonal neighbors until the pattern matches the target."
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
