import { useOrbitTapWorkspace } from "../../../lib/client/usecase/game-workspace/use-orbit-tap-workspace";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./OrbitTapGameWorkspace.module.css";

function toOrbitMarkerStyle(angle: number, radiusPx: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  const x = Math.cos(radians) * radiusPx;
  const y = Math.sin(radians) * radiusPx;

  return {
    transform: `translate(${x}px, ${y}px)`,
  };
}

export function OrbitTapGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useOrbitTapWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Hits {screen.orbitTap.hitCount}/{screen.orbitTap.hitGoal}</span>
            <span className="status-badge status-badge-neutral">Misses {screen.orbitTap.missCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["orbit-board-card"]].join(" ")} aria-label="Orbit Tap board">
        <div className={[styles["orbit-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <button
            aria-label="Tap the orbit when the marker reaches the gate"
            className={styles["orbit-button"]}
            onClick={screen.handleOrbitPress}
            type="button"
          >
            <span className={styles["orbit-ring"]} />
            <span
              aria-hidden="true"
              className={styles["orbit-gate"]}
              style={{ transform: `rotate(${screen.orbitTap.gateAngle}deg)` }}
            />
            <span
              aria-hidden="true"
              className={styles["orbit-marker"]}
              style={toOrbitMarkerStyle(screen.orbitTap.markerAngle, screen.orbitTap.radiusPx)}
            />
            <span className={styles["orbit-copy"]}>Tap on the gate</span>
          </button>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Chain clean hits while the marker crosses the highlighted gate."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Orbit ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
