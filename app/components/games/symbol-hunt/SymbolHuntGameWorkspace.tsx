import { useSymbolHuntWorkspace } from "../../../lib/client/usecase/game-workspace/use-symbol-hunt-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
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
          <GameplayContextCue
            className={styles["hunt-copy"]}
            detail={`Target ${screen.symbolHunt.targetSymbol}.`}
            phase={screen.isLiveRun ? "Hunt" : "Ready"}
            title="Tap every copy of the target symbol"
            tone="target"
          />
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
            detail="Clear every copy of the target symbol."
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
