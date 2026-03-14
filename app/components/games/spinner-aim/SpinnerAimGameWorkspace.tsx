import { useSpinnerAimWorkspace } from "../../../lib/client/usecase/game-workspace/use-spinner-aim-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./SpinnerAimGameWorkspace.module.css";

function toArcStyle(angle: number) {
  return {
    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
  };
}

function toLauncherStyle(angle: number) {
  return {
    transform: `translate(-50%, -100%) rotate(${angle}deg)`,
  };
}

export function SpinnerAimGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useSpinnerAimWorkspace(workspace);
  const badShotCount = screen.spinnerAim.hazardHitCount + screen.spinnerAim.missCount;

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
              Hits {screen.spinnerAim.hitCount}/{screen.spinnerAim.hitGoal}
            </span>
            <span className="status-badge status-badge-neutral">Hazards {screen.spinnerAim.hazardHitCount}</span>
            <span className="status-badge status-badge-neutral">Bad shots {badShotCount}</span>
            <span className="status-badge status-badge-neutral">Accuracy {screen.spinnerAim.accuracyPercent}%</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["spinner-aim-board-card"]].join(" ")} aria-label="Spinner Aim board">
        <div className={[styles["spinner-aim-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayContextCue
            className={styles["spinner-aim-copy"]}
            detail="Avoid the hazard arc."
            phase="Timing"
            title="Fire only through the target arc"
            tone="timing"
          />

          <div className={styles["spinner-aim-legend"]}>
            <span className={styles["spinner-aim-legend-target"]}>Target arc</span>
            <span className={styles["spinner-aim-legend-hazard"]}>Hazard arc</span>
            <span className={styles["spinner-aim-legend-neutral"]}>
              Last shot {screen.spinnerAim.lastShotWindow ?? "—"}
            </span>
          </div>

          <button
            aria-label="Fire the launcher"
            className={styles["spinner-aim-button"]}
            data-hazard-angle={Math.round(screen.spinnerAim.hazardAngle)}
            data-hazard-half-width={screen.spinnerAim.hazardHalfWidthDeg}
            data-launcher-angle={Math.round(screen.spinnerAim.launcherAngle)}
            data-shot-window={screen.spinnerAim.currentWindow}
            data-spinner-aim-root="true"
            data-target-angle={Math.round(screen.spinnerAim.targetAngle)}
            data-target-half-width={screen.spinnerAim.targetHalfWidthDeg}
            disabled={!screen.isLiveRun}
            onClick={screen.handleTriggerPress}
            type="button"
          >
            <span className={styles["spinner-aim-ring"]} />
            <span aria-hidden="true" className={styles["spinner-aim-target-arc"]} style={toArcStyle(screen.spinnerAim.targetAngle)} />
            <span aria-hidden="true" className={styles["spinner-aim-hazard-arc"]} style={toArcStyle(screen.spinnerAim.hazardAngle)} />
            <span aria-hidden="true" className={styles["spinner-aim-launcher"]} style={toLauncherStyle(screen.spinnerAim.launcherAngle)}>
              <span className={styles["spinner-aim-launcher-tip"]} />
            </span>
            <span className={styles["spinner-aim-hub"]} />
            <span className={styles["spinner-aim-button-copy"]}>Fire shot</span>
          </button>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Watch the launcher sweep around the ring and fire only while it points through the target arc."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Launcher ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
