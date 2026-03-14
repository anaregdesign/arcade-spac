import { useBounceAngleWorkspace } from "../../../lib/client/usecase/game-workspace/use-bounce-angle-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplaySidecarLayout } from "../../gameplay/layouts/GameplaySidecarLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./BounceAngleGameWorkspace.module.css";

function toTracePath(points: { x: number; y: number }[]) {
  if (points.length === 0) {
    return "";
  }

  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export function BounceAngleGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useBounceAngleWorkspace(workspace);
  const tracePath = toTracePath(screen.bounceAngle.tracePoints);
  const bounceMarkers = screen.bounceAngle.tracePoints.slice(1, -1);

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
              Board {screen.bounceAngle.currentPuzzleIndex + 1}/{screen.bounceAngle.puzzleCount}
            </span>
            <span className="status-badge status-badge-neutral">Target {screen.bounceAngle.targetPocketLabel}</span>
            <span className="status-badge status-badge-neutral">Shots {screen.bounceAngle.shotsUsed}</span>
            <span className="status-badge status-badge-neutral">Last bounces {screen.bounceAngle.lastBounceCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section
        aria-label="Bounce Angle board"
        className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["bounce-angle-board-card"]].join(" ")}
      >
        <div
          className={[styles["bounce-angle-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-bounce-angle-root="true"
          data-last-outcome={screen.bounceAngle.lastOutcome ?? ""}
          data-selected-angle={screen.bounceAngle.selectedAngleId}
          data-shots-used={screen.bounceAngle.shotsUsed}
          data-solution-angle={screen.bounceAngle.solutionAngleId}
          data-state={screen.bounceAngle.state}
        >
          <GameplayContextCue
            className={styles["bounce-angle-copy"]}
            detail={`Goal pocket ${screen.bounceAngle.targetPocketLabel}.`}
            phase={screen.isLiveRun ? "Aim" : "Ready"}
            title="Choose one angle, then launch"
            tone="target"
          />

          <GameplaySidecarLayout className={styles["workspace-grid"]} desktopMain="1.22fr" desktopSide="0.92fr" desktopSideMin="16rem" mobileSideMin="7.8rem" mobileSideMax="8.6rem">
            <div className={styles["board-panel"]}>
              <svg
                aria-label="Bounce Angle ricochet board"
                className={styles["board-svg"]}
                viewBox={`0 0 ${screen.bounceAngle.boardWidth} ${screen.bounceAngle.boardHeight}`}
              >
                <path className={styles["wall-path"]} d="M 12 172 L 12 12 L 228 12 L 228 172" />

                {screen.bounceAngle.pockets.map((pocket) => (
                  <g
                    className={[
                      styles["pocket-group"],
                      styles[`pocket-${pocket.status}`],
                      pocket.isLastLanding ? styles["pocket-last"] : "",
                    ].filter(Boolean).join(" ")}
                    key={pocket.id}
                    transform={`translate(${pocket.x}, 12)`}
                  >
                    <rect className={styles["pocket-body"]} x={-10} y={-6} width={20} height={12} rx={5} />
                    <text className={styles["pocket-label"]} textAnchor="middle" x="0" y="-11">
                      {pocket.label}
                    </text>
                  </g>
                ))}

                {tracePath ? <path className={styles["trace-path"]} d={tracePath} /> : null}
                {bounceMarkers.map((point, index) => (
                  <circle className={styles["bounce-marker"]} cx={point.x} cy={point.y} key={`bounce-marker-${index}`} r="3.5" />
                ))}
                <circle className={styles["launcher-pad"]} cx="120" cy="172" r="8" />
              </svg>

              <div className={styles["legend-row"]}>
                <span className={styles["legend-target"]}>Goal pocket</span>
                <span className={styles["legend-hazard"]}>Hazard pocket</span>
                <span className={styles["legend-neutral"]}>
                  Requires {screen.bounceAngle.requiredBounces} bank{screen.bounceAngle.requiredBounces === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className={styles["control-panel"]}>
              <div className={styles["angle-grid"]}>
                {screen.bounceAngle.angleOptions.map((angle) => (
                  <button
                    className={[styles["angle-button"], angle.isSelected ? styles["angle-button-selected"] : ""].filter(Boolean).join(" ")}
                    data-angle-id={angle.id}
                    data-angle-selected={angle.isSelected ? "true" : "false"}
                    disabled={!screen.isLiveRun}
                    key={angle.id}
                    onClick={() => screen.handleAngleSelect(angle.id)}
                    type="button"
                  >
                    <span className={styles["angle-label"]}>{angle.label}</span>
                    <span className={styles["angle-meta"]}>{angle.bounceCount} bank{angle.bounceCount === 1 ? "" : "s"}</span>
                  </button>
                ))}
              </div>

              <button
                className={styles["launch-button"]}
                data-bounce-angle-action="launch"
                disabled={!screen.isLiveRun}
                onClick={screen.handleLaunch}
                type="button"
              >
                Launch
              </button>
            </div>
          </GameplaySidecarLayout>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Read the bank shot, then launch into the goal pocket."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Ricochet board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
