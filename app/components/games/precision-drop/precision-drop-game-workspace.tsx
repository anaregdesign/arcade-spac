import { useEffect, useRef } from "react";
import { useNavigation, useSubmit } from "react-router";

import { usePrecisionDropSession } from "../../../lib/client/usecase/game-workspace/use-precision-drop-session";
import { playBallDrop, playRunClear, playRunFail, playRunStart } from "../../../lib/client/sound-effects";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./precision-drop-game-workspace.module.css";

function formatElapsedMs(elapsedMs: number) {
  return `${(elapsedMs / 1000).toFixed(2)}s`;
}

export function PrecisionDropGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const submittedOutcomeRef = useRef<"cleared" | "failed" | null>(null);
  const precisionDrop = usePrecisionDropSession(workspace.difficulty);
  const isRunIdle = precisionDrop.state === "idle";
  const isLiveRun = precisionDrop.state === "playing";
  const isRunCleared = precisionDrop.state === "cleared";
  const isRunFailed = precisionDrop.state === "failed";
  const resolvedOffsetPx = precisionDrop.resolvedOffsetPx ?? precisionDrop.currentOffsetPx;
  const resultIntent = resolvedOffsetPx <= 6 ? "completeClean" : "completeSteady";
  const runStatusLabel = isRunCleared ? "Hit" : isRunFailed ? "Missed" : isLiveRun ? "Live" : "Ready";
  const startActionLabel = isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Drop again" : "Start run";
  const saveStatusLabel = navigation.state === "submitting"
    ? "Opening result"
    : isRunCleared || isRunFailed
      ? "Opening result"
      : isLiveRun
        ? "Tap on overlap"
        : "Start run to arm the lane";
  const lanePrompt = isLiveRun
    ? "Tap anywhere in the lane when the ball overlaps the line."
    : isRunCleared
      ? "Hit recorded. The Result screen opens automatically."
      : isRunFailed
        ? "The ball passed the line before the hit landed."
        : "Press Start run, then tap when the ball overlaps the line.";

  useEffect(() => {
    workspace.setPlaying(precisionDrop.state === "playing");
  }, [precisionDrop.state, workspace]);

  useEffect(() => {
    if (precisionDrop.state === "cleared") {
      playRunClear();
    } else if (precisionDrop.state === "failed") {
      playRunFail();
    }
  }, [precisionDrop.state]);

  useEffect(() => {
    if (precisionDrop.state !== "cleared" && precisionDrop.state !== "failed") {
      submittedOutcomeRef.current = null;
      return;
    }

    if (submittedOutcomeRef.current === precisionDrop.state) {
      return;
    }

    submittedOutcomeRef.current = precisionDrop.state;
    workspace.finishRun();

    const formData = new FormData();
    formData.set("intent", precisionDrop.state === "failed" ? "fail" : resultIntent);
    formData.set("difficulty", workspace.difficulty);
    formData.set("primaryMetric", String(resolvedOffsetPx));
    submit(formData, { method: "post" });
  }, [precisionDrop.state, resolvedOffsetPx, resultIntent, submit, workspace]);

  return (
    <>
      <GameWorkspaceControlsCard
        difficulty={workspace.difficulty}
        isDifficultyDisabled={isLiveRun}
        onDifficultyChange={workspace.changeDifficulty}
        primaryActions={(
          <GameInstructionsDialog instructions={instructions} />
        )}
        statusChips={(
          <>
            <span className="status-badge status-badge-neutral">{runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">Offset {resolvedOffsetPx} px</span>
            <span className="status-badge status-badge-neutral">Elapsed {formatElapsedMs(precisionDrop.elapsedMs)}</span>
            <span className="status-badge status-badge-neutral">Speed {precisionDrop.speedPxPerSecond} px/s</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"], styles["precision-drop-board-card"]].join(" ")} aria-label="Precision Drop lane">
        <div className={[styles["precision-drop-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <button
            aria-label={isLiveRun ? "Tap when the ball overlaps the line" : "Precision Drop play area"}
            className={styles["precision-drop-lane"]}
            disabled={!isLiveRun}
            onClick={() => {
              playBallDrop();
              precisionDrop.captureHit();
            }}
            type="button"
          >
            <span aria-hidden="true" className={styles["precision-drop-grid"]} />
            <span
              aria-hidden="true"
              className={styles["precision-drop-target-line"]}
              style={{ top: `${(precisionDrop.lineCenterY / precisionDrop.laneHeight) * 100}%` }}
            />
            <span
              aria-hidden="true"
              className={styles["precision-drop-ball"]}
              style={{ top: `${(precisionDrop.ballCenterY / precisionDrop.laneHeight) * 100}%` }}
            />
            <span className={styles["precision-drop-lane-copy"]}>{lanePrompt}</span>
          </button>
          <GameWorkspaceBoardOverlay
            actionLabel={startActionLabel}
            detail="Drop a ball, then tap when it overlaps the line."
            isVisible={isRunIdle}
            onAction={() => {
              playRunStart();
              workspace.beginRun();
              precisionDrop.beginRun();
            }}
            title="Precision Drop lane"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard
        detail={
          isRunCleared
            ? "A smaller offset scores better and opens the Result screen automatically."
            : isRunFailed
              ? "Missed runs are recorded for history and open the Result screen automatically."
              : "Tap once when the ball overlaps the line. If the ball drops past the lane, the run is recorded as missed."
        }
        emphasis={saveStatusLabel}
      />
    </>
  );
}
