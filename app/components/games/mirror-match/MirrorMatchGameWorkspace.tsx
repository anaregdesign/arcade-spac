import { useMirrorMatchWorkspace } from "../../../lib/client/usecase/game-workspace/use-mirror-match-workspace";
import { GameplayTwinPanelLayout } from "../../gameplay/GameplayLayoutVariants";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./MirrorMatchGameWorkspace.module.css";

function Board({
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
    <div className={styles["mirror-panel"]}>
      <p className="eyebrow">{title}</p>
      <div className={styles["mirror-board"]} style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
        {board.flatMap((row, rowIndex) =>
          row.map((isLit, columnIndex) => {
            const className = [styles["mirror-cell"], isLit ? styles["mirror-cell-lit"] : ""].filter(Boolean).join(" ");

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

export function MirrorMatchGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useMirrorMatchWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Moves {screen.mirrorMatch.moveCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["mirror-workspace-card"]].join(" ")} aria-label="Mirror Match board">
        <div className={[styles["mirror-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayTwinPanelLayout className={styles["mirror-columns"]}>
            <Board board={screen.mirrorMatch.targetGrid} columnCount={screen.mirrorMatch.columnCount} title="Target" />
            <Board
              board={screen.mirrorMatch.liveGrid}
              columnCount={screen.mirrorMatch.columnCount}
              onCellPress={screen.handleCellPress}
              title="Mirror"
            />
          </GameplayTwinPanelLayout>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Copy the horizontally mirrored target pattern on the editable board."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Mirror ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
