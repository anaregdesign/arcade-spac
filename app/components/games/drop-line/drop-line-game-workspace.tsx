import { useEffect, useRef } from "react";
import { useNavigation, useSubmit } from "react-router";

import { useDropLineSession } from "../../../lib/client/usecase/game-workspace/use-drop-line-session";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";

function formatElapsedMs(elapsedMs: number) {
  return `${(elapsedMs / 1000).toFixed(2)}s`;
}

export function DropLineGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const submittedOutcomeRef = useRef<"cleared" | "failed" | null>(null);
  const dropLine = useDropLineSession(workspace.difficulty);
  const isRunIdle = dropLine.state === "idle";
  const isLiveRun = dropLine.state === "playing";
  const isRunCleared = dropLine.state === "cleared";
  const isRunFailed = dropLine.state === "failed";
  const resolvedOffsetPx = dropLine.resolvedOffsetPx ?? dropLine.currentOffsetPx;
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
    workspace.setPlaying(dropLine.state === "playing");
  }, [dropLine.state, workspace]);

  useEffect(() => {
    if (dropLine.state !== "cleared" && dropLine.state !== "failed") {
      submittedOutcomeRef.current = null;
      return;
    }

    if (submittedOutcomeRef.current === dropLine.state) {
      return;
    }

    submittedOutcomeRef.current = dropLine.state;
    workspace.finishRun();

    const formData = new FormData();
    formData.set("intent", dropLine.state === "failed" ? "fail" : resultIntent);
    formData.set("difficulty", workspace.difficulty);
    formData.set("primaryMetric", String(resolvedOffsetPx));
    submit(formData, { method: "post" });
  }, [dropLine.state, resolvedOffsetPx, resultIntent, submit, workspace]);

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
            <span className="status-badge status-badge-neutral">Elapsed {formatElapsedMs(dropLine.elapsedMs)}</span>
            <span className="status-badge status-badge-neutral">Speed {dropLine.speedPxPerSecond} px/s</span>
          </>
        )}
      />

      <section className="feature-card workspace-card board-card board-card-minimal drop-line-board-card" aria-label="Drop Ball lane">
        <div className="drop-line-shell game-board-overlay-shell">
          <button
            aria-label={isLiveRun ? "Tap when the ball overlaps the line" : "Drop Ball play area"}
            className="drop-line-lane"
            disabled={!isLiveRun}
            onClick={() => dropLine.captureHit()}
            type="button"
          >
            <span aria-hidden="true" className="drop-line-grid" />
            <span
              aria-hidden="true"
              className="drop-line-target-line"
              style={{ top: `${(dropLine.lineCenterY / dropLine.laneHeight) * 100}%` }}
            />
            <span
              aria-hidden="true"
              className="drop-line-ball"
              style={{ top: `${(dropLine.ballCenterY / dropLine.laneHeight) * 100}%` }}
            />
            <span className="drop-line-lane-copy">{lanePrompt}</span>
          </button>
          <GameWorkspaceBoardOverlay
            actionLabel={startActionLabel}
            detail="Drop a ball, then tap when it overlaps the line."
            isVisible={isRunIdle}
            onAction={() => {
              workspace.beginRun();
              dropLine.beginRun();
            }}
            title="Drop Ball lane"
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
