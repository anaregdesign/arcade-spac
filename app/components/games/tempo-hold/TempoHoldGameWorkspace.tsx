import type { PointerEvent as ReactPointerEvent } from "react";

import { useTempoHoldWorkspace } from "../../../lib/client/usecase/game-workspace/use-tempo-hold-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./TempoHoldGameWorkspace.module.css";

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function toMeterPercent(valueMs: number, maxMeterDurationMs: number) {
  return clampPercent((valueMs / maxMeterDurationMs) * 100);
}

function toTargetZoneStyle(targetDurationMs: number, toleranceMs: number, maxMeterDurationMs: number) {
  const leftPercent = toMeterPercent(targetDurationMs - toleranceMs, maxMeterDurationMs);
  const rightPercent = toMeterPercent(targetDurationMs + toleranceMs, maxMeterDurationMs);

  return {
    left: `${leftPercent}%`,
    width: `${Math.max(4, rightPercent - leftPercent)}%`,
  };
}

function toMeterFillStyle(holdElapsedMs: number, maxMeterDurationMs: number) {
  return {
    width: `${toMeterPercent(holdElapsedMs, maxMeterDurationMs)}%`,
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

function getWindowCopy(isHolding: boolean, window: "good" | "miss" | "perfect") {
  if (!isHolding) {
    return "Hold to start";
  }

  if (window === "perfect") {
    return "Perfect window";
  }

  if (window === "good") {
    return "Good window";
  }

  return "Keep holding";
}

export function TempoHoldGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useTempoHoldWorkspace(workspace);
  const currentRoundLabel = screen.tempoHold.completedRoundCount >= screen.tempoHold.roundGoal ? "—" : screen.tempoHold.currentRoundIndex + 1;

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!screen.isLiveRun || screen.tempoHold.isHolding) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    screen.handleHoldPressStart();
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }

    screen.handleHoldRelease();
  }

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
              Round {currentRoundLabel}/{screen.tempoHold.roundGoal}
            </span>
            <span className="status-badge status-badge-neutral">Target {Math.round(screen.tempoHold.targetDurationMs)} ms</span>
            <span className="status-badge status-badge-neutral">Perfect {screen.tempoHold.perfectReleaseCount}</span>
            <span className="status-badge status-badge-neutral">Misses {screen.tempoHold.missCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["tempo-hold-board-card"]].join(" ")} aria-label="Tempo Hold board">
        <div className={[styles["tempo-hold-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayContextCue
            className={styles["tempo-hold-copy"]}
            detail="Press, hold, then let go."
            phase="Hold"
            title="Release inside the target zone"
            tone="timing"
          />

          <div className={styles["tempo-hold-legend"]}>
            <span className={styles["tempo-hold-legend-target"]}>Target zone</span>
            <span className={styles["tempo-hold-legend-perfect"]}>Perfect window</span>
            <span className={styles["tempo-hold-legend-status"]}>Last {getJudgmentCopy(screen.tempoHold.lastJudgment)}</span>
          </div>

          <button
            aria-label="Hold and release to match the target tempo"
            className={[
              styles["tempo-hold-button"],
              screen.tempoHold.isHolding ? styles["tempo-hold-button-holding"] : "",
              screen.tempoHold.currentWindow === "perfect" && screen.tempoHold.isHolding ? styles["tempo-hold-button-perfect"] : "",
              screen.tempoHold.currentWindow === "good" && screen.tempoHold.isHolding ? styles["tempo-hold-button-good"] : "",
            ].filter(Boolean).join(" ")}
            data-elapsed-ms={Math.round(screen.tempoHold.holdElapsedMs)}
            data-holding={screen.tempoHold.isHolding ? "true" : "false"}
            data-last-release={screen.tempoHold.lastJudgment ?? "none"}
            data-target-ms={Math.round(screen.tempoHold.targetDurationMs)}
            data-tempo-hold-root="true"
            data-window={screen.tempoHold.currentWindow}
            disabled={!screen.isLiveRun}
            onPointerCancel={handlePointerUp}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            type="button"
          >
            <span className={styles["tempo-hold-button-header"]}>
              <span className={styles["tempo-hold-target-label"]}>Target {Math.round(screen.tempoHold.targetDurationMs)} ms</span>
              <span className={styles["tempo-hold-window-label"]}>
                {getWindowCopy(screen.tempoHold.isHolding, screen.tempoHold.currentWindow)}
              </span>
            </span>

            <span className={styles["tempo-hold-meter"]}>
              <span className={styles["tempo-hold-meter-track"]} />
              <span
                aria-hidden="true"
                className={styles["tempo-hold-meter-good-zone"]}
                style={toTargetZoneStyle(
                  screen.tempoHold.targetDurationMs,
                  screen.tempoHold.goodToleranceMs,
                  screen.tempoHold.maxMeterDurationMs,
                )}
              />
              <span
                aria-hidden="true"
                className={styles["tempo-hold-meter-perfect-zone"]}
                style={toTargetZoneStyle(
                  screen.tempoHold.targetDurationMs,
                  screen.tempoHold.perfectToleranceMs,
                  screen.tempoHold.maxMeterDurationMs,
                )}
              />
              <span
                aria-hidden="true"
                className={styles["tempo-hold-meter-fill"]}
                style={toMeterFillStyle(screen.tempoHold.holdElapsedMs, screen.tempoHold.maxMeterDurationMs)}
              />
            </span>

            <span className={styles["tempo-hold-readout"]}>
              <strong>{Math.round(screen.tempoHold.holdElapsedMs)} ms</strong>
              <span>{screen.tempoHold.isHolding ? "Release inside the bright zone" : "Press and hold"}</span>
            </span>
          </button>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Press and hold the pad, watch the meter move into the target zone, and release there to score the round."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Hold pad ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
