import { useBeatMatchWorkspace } from "../../../lib/client/usecase/game-workspace/use-beat-match-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplayTapControlLayout } from "../../gameplay/layouts/GameplayTapControlLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./BeatMatchGameWorkspace.module.css";

const laneLabels = ["Left", "Center", "Right"];

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

function toMarkerStyle(percent: number) {
  return {
    left: `${percent}%`,
  };
}

function toWindowStyle(windowMs: number, leadInMs: number) {
  const percent = Math.max(4, (windowMs / (leadInMs * 2)) * 100 * 2);

  return {
    width: `${percent}%`,
  };
}

export function BeatMatchGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useBeatMatchWorkspace(workspace);

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
              Hits {screen.beatMatch.hitCount}/{screen.beatMatch.hitGoal}
            </span>
            <span className="status-badge status-badge-neutral">Combo {screen.beatMatch.comboCount}</span>
            <span className="status-badge status-badge-neutral">Max combo {screen.beatMatch.maxComboCount}</span>
            <span className="status-badge status-badge-neutral">Accuracy {screen.beatMatch.accuracyPercent}%</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["beat-match-board-card"]].join(" ")} aria-label="Beat Match board">
        <div className={[styles["beat-match-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayTapControlLayout>
          <GameplayContextCue className={styles["beat-match-copy"]} phase="Timing" title="Hit the lit lane in the center zone" tone="timing" />

          <div className={styles["beat-match-legend"]}>
            <span className={styles["beat-match-legend-target"]}>Hit zone</span>
            <span className={styles["beat-match-legend-perfect"]}>Perfect center</span>
            <span className={styles["beat-match-legend-status"]}>Last {getJudgmentCopy(screen.beatMatch.lastJudgment)}</span>
          </div>

          <div
            className={styles["beat-match-board"]}
            data-active-lane={screen.beatMatch.activeLaneIndex ?? -1}
            data-beat-match-root="true"
            data-combo={screen.beatMatch.comboCount}
            data-note-index={screen.beatMatch.currentNoteIndex}
            data-window={screen.beatMatch.currentWindow}
          >
            <div className={styles["beat-match-track"]}>
              <span className={styles["beat-match-track-line"]} />
              <span className={styles["beat-match-good-zone"]} style={toWindowStyle(screen.beatMatch.goodWindowMs, screen.beatMatch.leadInMs)} />
              <span className={styles["beat-match-perfect-zone"]} style={toWindowStyle(screen.beatMatch.perfectWindowMs, screen.beatMatch.leadInMs)} />
              <span className={styles["beat-match-marker"]} style={toMarkerStyle(screen.beatMatch.timingMarkerPercent)} />
            </div>

            <div className={styles["beat-match-queue"]}>
              {screen.beatMatch.upcomingNotes.map((note, index) => (
                <span
                  className={[
                    styles["beat-match-queue-chip"],
                    index === 0 ? styles["beat-match-queue-chip-active"] : "",
                  ].filter(Boolean).join(" ")}
                  key={note.id}
                >
                  {laneLabels[note.laneIndex] ?? `Lane ${note.laneIndex + 1}`}
                </span>
              ))}
            </div>

            <div className={styles["beat-match-lanes"]}>
              {Array.from({ length: screen.beatMatch.laneCount }, (_, laneIndex) => (
                <button
                  aria-label={`Beat lane ${laneLabels[laneIndex] ?? laneIndex + 1}`}
                  className={[
                    styles["beat-match-lane"],
                    screen.beatMatch.activeLaneIndex === laneIndex ? styles["beat-match-lane-active"] : "",
                  ].filter(Boolean).join(" ")}
                  data-active={screen.beatMatch.activeLaneIndex === laneIndex ? "true" : "false"}
                  data-beat-match-lane={laneIndex}
                  disabled={!screen.isLiveRun}
                  key={laneIndex}
                  onClick={() => screen.handleLanePress(laneIndex)}
                  type="button"
                >
                  <span className={styles["beat-match-lane-label"]}>{laneLabels[laneIndex] ?? `Lane ${laneIndex + 1}`}</span>
                  <span className={styles["beat-match-lane-copy"]}>
                    {screen.beatMatch.activeLaneIndex === laneIndex ? "Tap now" : "Stand by"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          </GameplayTapControlLayout>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Watch the timing marker approach the center zone, then tap the highlighted lane to keep your combo alive."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Beat lanes ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
