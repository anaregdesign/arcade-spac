import { useTargetTrailWorkspace } from "../../../lib/client/usecase/game-workspace/use-target-trail-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./TargetTrailGameWorkspace.module.css";

export function TargetTrailGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useTargetTrailWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Trail {screen.targetTrail.stepCount}/{screen.targetTrail.targetCount}</span>
            <span className="status-badge status-badge-neutral">Misses {screen.targetTrail.missCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["trail-board-card"]].join(" ")} aria-label="Target Trail board">
        <div className={[styles["trail-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayContextCue
            className={styles["trail-copy"]}
            detail="Tap the active target every jump."
            phase={screen.isLiveRun ? "Track" : "Ready"}
            title="Follow the moving target trail"
            tone="target"
          />
          <div
            className={styles["trail-grid"]}
            style={{ gridTemplateColumns: `repeat(${screen.targetTrail.columnCount}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: screen.targetTrail.rowCount * screen.targetTrail.columnCount }, (_, index) => {
              const rowIndex = Math.floor(index / screen.targetTrail.columnCount);
              const columnIndex = index % screen.targetTrail.columnCount;
              const isActive = index === screen.targetTrail.activeTargetIndex;
              const isVisited = screen.targetTrail.visited[index];

              return (
                <button
                  aria-label={`Trail tile ${rowIndex + 1}-${columnIndex + 1}`}
                  className={[
                    styles["trail-cell"],
                    isActive ? styles["trail-cell-active"] : "",
                    isVisited ? styles["trail-cell-visited"] : "",
                  ].filter(Boolean).join(" ")}
                  key={`target-trail-${index}`}
                  onClick={() => screen.handleTilePress(rowIndex, columnIndex)}
                  type="button"
                >
                  <span className={styles["trail-cell-core"]} />
                </button>
              );
            })}
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Tap the highlighted target after every jump."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Trail ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
