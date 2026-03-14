import { usePrecisionDropWorkspace } from "../../../lib/client/usecase/game-workspace/use-precision-drop-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./PrecisionDropGameWorkspace.module.css";

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
          <GameplayContextCue
            className={styles["precision-drop-copy"]}
            detail={`${screen.precisionDrop.speedPxPerSecond} px/s.`}
            phase={screen.isLiveRun ? "Drop" : "Ready"}
            title="Tap when the ball crosses the line"
            tone="timing"
          />
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
            detail="Tap once the ball reaches the line."
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
