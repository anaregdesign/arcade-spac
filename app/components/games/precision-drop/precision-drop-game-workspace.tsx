import { usePrecisionDropWorkspace } from "../../../lib/client/usecase/game-workspace/use-precision-drop-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./precision-drop-game-workspace.module.css";

export function PrecisionDropGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = usePrecisionDropWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">{screen.runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">Offset {screen.resolvedOffsetPx} px</span>
            <span className="status-badge status-badge-neutral">Elapsed {screen.timeLabel}</span>
            <span className="status-badge status-badge-neutral">Speed {screen.precisionDrop.speedPxPerSecond} px/s</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"], styles["precision-drop-board-card"]].join(" ")} aria-label="Precision Drop lane">
        <div className={[styles["precision-drop-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <button
            aria-label={screen.isLiveRun ? "Tap when the ball overlaps the line" : "Precision Drop play area"}
            className={styles["precision-drop-lane"]}
            disabled={!screen.isLiveRun}
            onClick={screen.handleLaneClick}
            type="button"
          >
            <span aria-hidden="true" className={styles["precision-drop-grid"]} />
            <span
              aria-hidden="true"
              className={styles["precision-drop-target-line"]}
              style={{ top: `${(screen.precisionDrop.lineCenterY / screen.precisionDrop.laneHeight) * 100}%` }}
            />
            <span
              aria-hidden="true"
              className={styles["precision-drop-ball"]}
              style={{ top: `${(screen.precisionDrop.ballCenterY / screen.precisionDrop.laneHeight) * 100}%` }}
            />
            <span className={styles["precision-drop-lane-copy"]}>{screen.lanePrompt}</span>
          </button>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Drop a ball, then tap when it overlaps the line."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Precision Drop lane"
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
