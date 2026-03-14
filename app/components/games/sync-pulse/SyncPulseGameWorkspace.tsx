import { useSyncPulseWorkspace } from "../../../lib/client/usecase/game-workspace/use-sync-pulse-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./SyncPulseGameWorkspace.module.css";

function toPulseStyle(radiusPx: number) {
  const diameterPx = Math.max(32, radiusPx * 2);

  return {
    height: `${diameterPx}px`,
    width: `${diameterPx}px`,
  };
}

function getJudgmentCopy(judgment: "good" | "miss" | "perfect" | null) {
  if (judgment === "perfect") {
    return "Perfect";
  }

  if (judgment === "good") {
    return "Good";
  }

  if (judgment === "miss") {
    return "Miss";
  }

  return "—";
}

function getWindowCopy(window: "good" | "miss" | "perfect") {
  if (window === "perfect") {
    return "Perfect window";
  }

  if (window === "good") {
    return "Good window";
  }

  return "Outside sync";
}

export function SyncPulseGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useSyncPulseWorkspace(workspace);
  const currentWaveLabel = screen.syncPulse.clearedWaveCount >= screen.syncPulse.waveGoal ? "—" : screen.syncPulse.currentWaveIndex + 1;

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
              Wave {currentWaveLabel}/{screen.syncPulse.waveGoal}
            </span>
            <span className="status-badge status-badge-neutral">Perfect {screen.syncPulse.perfectHitCount}</span>
            <span className="status-badge status-badge-neutral">Misses {screen.syncPulse.missCount}</span>
            <span className="status-badge status-badge-neutral">Last {getJudgmentCopy(screen.syncPulse.lastJudgment)}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["sync-pulse-board-card"]].join(" ")} aria-label="Sync Pulse board">
        <div className={[styles["sync-pulse-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayContextCue className={styles["sync-pulse-copy"]} phase="Timing" title="Tap when both rings overlap" tone="timing" />

          <div className={styles["sync-pulse-legend"]}>
            <span className={styles["sync-pulse-legend-a"]}>Pulse A</span>
            <span className={styles["sync-pulse-legend-b"]}>Pulse B</span>
            <span className={styles["sync-pulse-legend-window"]}>{getWindowCopy(screen.syncPulse.currentWindow)}</span>
          </div>

          <button
            aria-label="Tap to sync the pulse rings"
            className={[
              styles["sync-pulse-button"],
              screen.syncPulse.currentWindow === "perfect" ? styles["sync-pulse-button-perfect"] : "",
              screen.syncPulse.currentWindow === "good" ? styles["sync-pulse-button-good"] : "",
            ].filter(Boolean).join(" ")}
            data-gap={Math.round(screen.syncPulse.gapPx)}
            data-pulse-a-radius={Math.round(screen.syncPulse.pulseARadiusPx)}
            data-pulse-b-radius={Math.round(screen.syncPulse.pulseBRadiusPx)}
            data-sync-pulse-root="true"
            data-window={screen.syncPulse.currentWindow}
            disabled={!screen.isLiveRun}
            onClick={screen.handleSyncPress}
            type="button"
          >
            <span aria-hidden="true" className={styles["sync-pulse-stage-glow"]} />
            <span aria-hidden="true" className={styles["sync-pulse-ring-a"]} style={toPulseStyle(screen.syncPulse.pulseARadiusPx)} />
            <span aria-hidden="true" className={styles["sync-pulse-ring-b"]} style={toPulseStyle(screen.syncPulse.pulseBRadiusPx)} />
            <span className={styles["sync-pulse-core"]}>
              <span className={styles["sync-pulse-core-label"]}>Tap to sync</span>
              <span className={styles["sync-pulse-core-detail"]}>{getWindowCopy(screen.syncPulse.currentWindow)}</span>
            </span>
          </button>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Watch the two pulse rings breathe in and out, then tap only while they overlap tightly."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Pulse board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
