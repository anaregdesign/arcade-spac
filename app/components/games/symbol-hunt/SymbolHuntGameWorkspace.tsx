import { useSymbolHuntWorkspace } from "../../../lib/client/usecase/game-workspace/use-symbol-hunt-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./SymbolHuntGameWorkspace.module.css";

export function SymbolHuntGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useSymbolHuntWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Target {screen.symbolHunt.targetSymbol}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
            <span className="status-badge status-badge-neutral">
              Found {screen.symbolHunt.targetCount - screen.symbolHunt.remainingTargetCount}/{screen.symbolHunt.targetCount}
            </span>
            <span className="status-badge status-badge-neutral">Wrong taps {screen.symbolHunt.wrongTapCount}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["hunt-board-card"]].join(" ")} aria-label="Symbol Hunt board">
        <div className={[styles["hunt-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["hunt-legend"]}>
            <p className="eyebrow">Target symbol</p>
            <strong>{screen.symbolHunt.targetSymbol}</strong>
          </div>
          <div
            className={styles["hunt-grid"]}
            style={{ gridTemplateColumns: `repeat(${screen.symbolHunt.columnCount}, minmax(0, 1fr))` }}
          >
            {screen.symbolHunt.board.flatMap((row, rowIndex) =>
              row.map((cell, columnIndex) => (
                <button
                  aria-label={`Symbol tile ${rowIndex + 1}-${columnIndex + 1}`}
                  className={[
                    styles["hunt-cell"],
                    cell.isCleared ? styles["hunt-cell-cleared"] : "",
                  ].filter(Boolean).join(" ")}
                  key={cell.id}
                  onClick={() => screen.handleTilePress(rowIndex, columnIndex)}
                  type="button"
                >
                  {cell.symbol}
                </button>
              )),
            )}
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Tap every copy of the target symbol before time runs out."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
