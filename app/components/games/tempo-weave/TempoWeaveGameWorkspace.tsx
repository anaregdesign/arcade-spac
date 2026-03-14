import { useTempoWeaveWorkspace } from "../../../lib/client/usecase/game-workspace/use-tempo-weave-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./TempoWeaveGameWorkspace.module.css";

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

function getLaneButtonCopy(window: "good" | "miss" | "perfect", isCompleted: boolean) {
  if (isCompleted) {
    return "Lane complete";
  }

  if (window === "perfect") {
    return "Tap now";
  }

  if (window === "good") {
    return "Window open";
  }

  return "Track the beat";
}

function toMarkerStyle(percent: number) {
  return { left: `${percent}%` };
}

function toWindowStyle(size: number) {
  return { width: `${Math.max(6, size * 100 * 2)}%` };
}

export function TempoWeaveGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useTempoWeaveWorkspace(workspace);

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
              Hits {screen.tempoWeave.totalHitCount}/{screen.tempoWeave.totalTargetCount}
            </span>
            <span className="status-badge status-badge-neutral">Streak {screen.tempoWeave.currentStreak}</span>
            <span className="status-badge status-badge-neutral">Best {screen.tempoWeave.bestStreak}</span>
            <span className="status-badge status-badge-neutral">Density {screen.tempoWeave.densityLevel}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["tempo-weave-board-card"]].join(" ")} aria-label="Tempo Weave board">
        <div
          className={[styles["tempo-weave-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-density={screen.tempoWeave.densityLevel}
          data-state={screen.tempoWeave.state}
          data-streak={screen.tempoWeave.currentStreak}
          data-tempo-weave-root="true"
        >
          <div className={styles["tempo-weave-copy"]}>
            <p className="eyebrow">Dual-lane rhythm split</p>
            <strong>Watch both lanes and hit each center zone before the beat slips past.</strong>
            <p className="compact-copy">
              Each successful lane press advances only that lane. Long streaks increase density, so both tempos tighten while the miss margin stays the same.
            </p>
          </div>

          <div className={styles["tempo-weave-legend"]}>
            <span className={styles["tempo-weave-legend-good"]}>Good window</span>
            <span className={styles["tempo-weave-legend-perfect"]}>Perfect center</span>
            <span className={styles["tempo-weave-legend-status"]}>
              Last {screen.tempoWeave.lastLaneId ? `${screen.tempoWeave.lastLaneId} ${getJudgmentCopy(screen.tempoWeave.lastJudgment)}` : "—"}
            </span>
          </div>

          <div className={styles["tempo-weave-lanes"]}>
            {screen.tempoWeave.lanes.map((lane) => (
              <article
                className={[
                  styles["tempo-weave-lane-card"],
                  lane.theme === "sky" ? styles["tempo-weave-lane-card-sky"] : styles["tempo-weave-lane-card-rose"],
                  lane.isCompleted ? styles["tempo-weave-lane-card-complete"] : "",
                ].filter(Boolean).join(" ")}
                data-completed={lane.isCompleted ? "true" : "false"}
                data-hit-count={lane.hitCount}
                data-target-count={lane.targetHitCount}
                data-tempo-weave-lane={lane.id}
                data-window={lane.currentWindow}
                key={lane.id}
              >
                <header className={styles["tempo-weave-lane-header"]}>
                  <div>
                    <p className="eyebrow">{lane.label}</p>
                    <strong>{lane.isCompleted ? "Locked in" : `${lane.hitCount}/${lane.targetHitCount} hits`}</strong>
                  </div>
                  <div className={styles["tempo-weave-lane-meta"]}>
                    <span>{lane.accuracyPercent}% accuracy</span>
                    <span>{(lane.currentCycleMs / 1000).toFixed(2)}s cycle</span>
                  </div>
                </header>

                <div className={styles["tempo-weave-track"]}>
                  <span className={styles["tempo-weave-track-line"]} />
                  <span className={styles["tempo-weave-good-zone"]} style={toWindowStyle(screen.tempoWeave.goodWindowNormalized)} />
                  <span className={styles["tempo-weave-perfect-zone"]} style={toWindowStyle(screen.tempoWeave.perfectWindowNormalized)} />
                  <span className={styles["tempo-weave-marker"]} style={toMarkerStyle(lane.markerPercent)} />
                </div>

                <div className={styles["tempo-weave-lane-stats"]}>
                  <span>Window {getJudgmentCopy(lane.currentWindow)}</span>
                  <span>Perfect {lane.perfectHitCount}</span>
                  <span>Misses {lane.missCount}</span>
                </div>

                <button
                  aria-label={`Tempo Weave ${lane.label}`}
                  className={[
                    styles["tempo-weave-lane-button"],
                    lane.currentWindow === "perfect" ? styles["tempo-weave-lane-button-perfect"] : "",
                    lane.currentWindow === "good" ? styles["tempo-weave-lane-button-good"] : "",
                  ].filter(Boolean).join(" ")}
                  data-cycle-ms={lane.currentCycleMs}
                  data-hit-count={lane.hitCount}
                  data-marker-percent={lane.markerPercent}
                  data-target-count={lane.targetHitCount}
                  data-tempo-weave-lane-button={lane.id}
                  data-window={lane.currentWindow}
                  disabled={!screen.isLiveRun || lane.isCompleted}
                  onClick={() => screen.handleLanePress(lane.id)}
                  type="button"
                >
                  <span className={styles["tempo-weave-lane-button-label"]}>{lane.label}</span>
                  <span className={styles["tempo-weave-lane-button-copy"]}>{getLaneButtonCopy(lane.currentWindow, lane.isCompleted)}</span>
                </button>
              </article>
            ))}
          </div>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Start the run, then keep both lane markers in view and tap each lane only while its marker crosses the center zone."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Dual lanes ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
