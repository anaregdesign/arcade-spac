import { usePhaseLockWorkspace } from "../../../lib/client/usecase/game-workspace/use-phase-lock-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplayTapControlLayout } from "../../gameplay/layouts/GameplayTapControlLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./PhaseLockGameWorkspace.module.css";

function toBandStyle(angle: number) {
  return {
    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
  };
}

function toMarkerStyle(angle: number) {
  return {
    transform: `translate(-50%, -100%) rotate(${angle}deg)`,
  };
}

export function PhaseLockGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = usePhaseLockWorkspace(workspace);

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
              Locked {screen.phaseLock.lockedWheelCount}/{screen.phaseLock.wheelCount}
            </span>
            <span className="status-badge status-badge-neutral">
              Active {screen.phaseLock.lockedWheelCount >= screen.phaseLock.wheelCount ? "—" : screen.phaseLock.currentWheelIndex + 1}
            </span>
            <span className="status-badge status-badge-neutral">Errors {screen.phaseLock.timingErrorCount}</span>
            <span className="status-badge status-badge-neutral">Accuracy {screen.phaseLock.accuracyPercent}%</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["phase-lock-board-card"]].join(" ")} aria-label="Phase Lock board">
        <div className={[styles["phase-lock-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayTapControlLayout>
          <GameplayContextCue
            className={styles["phase-lock-copy"]}
            detail="Misses keep the wheel live."
            phase="Timing"
            title="Lock the active wheel inside the band"
            tone="timing"
          />

          <div className={styles["phase-lock-legend"]}>
            <span className={styles["phase-lock-legend-target"]}>Target band</span>
            <span className={styles["phase-lock-legend-active"]}>Active wheel</span>
            <span className={styles["phase-lock-legend-locked"]}>Locked wheel</span>
          </div>

          <div className={styles["phase-lock-grid"]}>
            {screen.phaseLock.wheels.map((wheel, index) => (
              <article
                className={[
                  styles["phase-lock-wheel-card"],
                  wheel.isActive ? styles["phase-lock-wheel-card-active"] : "",
                  wheel.isLocked ? styles["phase-lock-wheel-card-locked"] : "",
                ].filter(Boolean).join(" ")}
                data-active={wheel.isActive ? "true" : "false"}
                data-angle={Math.round(wheel.currentAngle)}
                data-locked={wheel.isLocked ? "true" : "false"}
                data-phase-lock-wheel="true"
                data-target-angle={Math.round(wheel.targetAngle)}
                data-wheel-index={index}
                key={wheel.id}
              >
                <header className={styles["phase-lock-wheel-header"]}>
                  <strong>Wheel {index + 1}</strong>
                  <span>{wheel.isLocked ? "Locked" : wheel.isActive ? "Active" : "Queued"}</span>
                </header>
                <div className={styles["phase-lock-wheel-stage"]}>
                  <span className={styles["phase-lock-wheel-ring"]} />
                  <span aria-hidden="true" className={styles["phase-lock-wheel-band"]} style={toBandStyle(wheel.targetAngle)} />
                  <span aria-hidden="true" className={styles["phase-lock-wheel-marker"]} style={toMarkerStyle(wheel.currentAngle)}>
                    <span className={styles["phase-lock-wheel-marker-tip"]} />
                  </span>
                  <span className={styles["phase-lock-wheel-hub"]} />
                </div>
              </article>
            ))}
          </div>

          <button
            aria-label="Lock current wheel"
            className={styles["phase-lock-trigger"]}
            data-active-wheel-index={screen.phaseLock.currentWheelIndex}
            data-phase-lock-trigger="true"
            data-target-half-width={screen.phaseLock.targetHalfWidthDeg}
            data-window={screen.phaseLock.activeWindow}
            disabled={!screen.isLiveRun}
            onClick={screen.handleLockPress}
            type="button"
          >
            <span className={styles["phase-lock-trigger-label"]}>Lock current wheel</span>
            <span className={styles["phase-lock-trigger-detail"]}>
              {screen.phaseLock.activeWindow === "target"
                ? "In band"
                : screen.phaseLock.activeWindow === "locked"
                  ? "Ready"
                  : "Outside band"}
            </span>
          </button>

          </GameplayTapControlLayout>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Watch the highlighted wheel and press Lock current wheel only while its marker passes through the target band."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Wheel stack ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
