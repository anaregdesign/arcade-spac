import { useGapRushWorkspace } from "../../../lib/client/usecase/game-workspace/use-gap-rush-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplaySidecarLayout } from "../../gameplay/layouts/GameplaySidecarLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./GapRushGameWorkspace.module.css";

function toPercent(position: number, laneCount: number) {
  return `${((position + 0.5) / laneCount) * 100}%`;
}

function getGapBoundsPercent(gapLane: number, gapHalfWidth: number, laneCount: number) {
  const gapStart = ((gapLane - gapHalfWidth + 0.5) / laneCount) * 100;
  const gapEnd = ((gapLane + gapHalfWidth + 0.5) / laneCount) * 100;

  return {
    end: `${Math.min(100, gapEnd)}%`,
    start: `${Math.max(0, gapStart)}%`,
  };
}

export function GapRushGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useGapRushWorkspace(workspace);
  const currentGap = getGapBoundsPercent(screen.gapRush.currentGapLane, screen.gapRush.gapHalfWidth, screen.gapRush.laneCount);
  const nextGap = screen.gapRush.nextGapLane === null
    ? null
    : getGapBoundsPercent(screen.gapRush.nextGapLane, screen.gapRush.gapHalfWidth, screen.gapRush.laneCount);

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
              Walls {screen.gapRush.clearedCount}/{screen.gapRush.targetWallCount}
            </span>
            <span className="status-badge status-badge-neutral">Perfect {screen.gapRush.perfectPassCount}</span>
            <span className="status-badge status-badge-neutral">Speed {screen.gapRush.currentSpeed.toFixed(2)}x</span>
            <span className="status-badge status-badge-neutral">Gap lane {screen.gapRush.currentGapLane + 1}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section
        aria-label="Gap Rush corridor"
        className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["gap-rush-board-card"]].join(" ")}
      >
        <div
          className={[styles["gap-rush-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-avatar-position={screen.gapRush.avatarPosition.toFixed(2)}
          data-cleared-count={screen.gapRush.clearedCount}
          data-current-gap-lane={screen.gapRush.currentGapLane}
          data-gap-rush-root="true"
          data-next-gap-lane={screen.gapRush.nextGapLane ?? ""}
          data-perfect-passes={screen.gapRush.perfectPassCount}
          data-solution-lane={screen.gapRush.solutionLane}
          data-state={screen.gapRush.state}
          data-wall-progress={screen.gapRush.wallProgress.toFixed(3)}
        >
          <GameplayContextCue
            detail={screen.gapRush.nextGapLane === null ? "Final wall ahead." : `Next gap: lane ${screen.gapRush.nextGapLane + 1}.`}
            phase={screen.isLiveRun ? "Glide" : "Ready"}
            title="Set the next lane early and stay centered in the opening"
            tone="target"
          />

          <GameplaySidecarLayout className={styles["workspace-grid"]} desktopMain="1.25fr" desktopSide="0.9fr" desktopSideMin="15rem" mobileSideMin="7.8rem" mobileSideMax="8.6rem">
            <div className={styles["corridor-panel"]}>
              <div className={styles["corridor"]}>
                {Array.from({ length: screen.gapRush.laneCount - 1 }, (_, index) => (
                  <span
                    aria-hidden="true"
                    className={styles["lane-guide"]}
                    key={`lane-guide-${index}`}
                    style={{ left: `${((index + 1) / screen.gapRush.laneCount) * 100}%` }}
                  />
                ))}

                {nextGap ? (
                  <div className={[styles["wall-band"], styles["wall-band-preview"]].join(" ")}>
                    <span className={styles["wall-segment"]} style={{ left: 0, width: nextGap.start }} />
                    <span className={styles["wall-segment"]} style={{ left: nextGap.end, width: `calc(100% - ${nextGap.end})` }} />
                  </div>
                ) : null}

                <div
                  className={styles["wall-band"]}
                  style={{ top: `${10 + screen.gapRush.wallProgress * 62}%` }}
                >
                  <span className={styles["wall-segment"]} style={{ left: 0, width: currentGap.start }} />
                  <span className={styles["wall-segment"]} style={{ left: currentGap.end, width: `calc(100% - ${currentGap.end})` }} />
                </div>

                <span
                  className={styles["avatar"]}
                  style={{ left: toPercent(screen.gapRush.avatarPosition, screen.gapRush.laneCount) }}
                />
              </div>
            </div>

            <div className={styles["control-panel"]}>
              <p className={styles["panel-title"]}>Lane target</p>
              <div className={styles["lane-button-grid"]}>
                {Array.from({ length: screen.gapRush.laneCount }, (_, lane) => (
                  <button
                    className={[
                      styles["lane-button"],
                      screen.gapRush.targetLane === lane ? styles["lane-button-selected"] : "",
                    ].filter(Boolean).join(" ")}
                    data-gap-lane={lane}
                    data-selected={screen.gapRush.targetLane === lane ? "true" : "false"}
                    disabled={!screen.isLiveRun}
                    key={`gap-lane-${lane}`}
                    onClick={() => screen.handleLaneSelect(lane)}
                    type="button"
                  >
                    Lane {lane + 1}
                  </button>
                ))}
              </div>
            </div>
          </GameplaySidecarLayout>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Select the next lane before the wall reaches the runner. The gap stays fixed, but the corridor speeds up every time you survive another wall."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Corridor ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
