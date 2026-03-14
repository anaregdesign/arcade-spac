import { useEffect } from "react";

import { playBallDrop, playRunClear, playRunFail, playRunStart } from "../../sound-effects";
import { formatElapsedMs } from "./display";
import { usePrecisionDropSession } from "./use-precision-drop-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function usePrecisionDropWorkspace(workspace: GameWorkspaceController) {
  const precisionDrop = usePrecisionDropSession(workspace.difficulty);
  const isRunIdle = precisionDrop.state === "idle";
  const isLiveRun = precisionDrop.state === "playing";
  const isRunCleared = precisionDrop.state === "cleared";
  const isRunFailed = precisionDrop.state === "failed";
  const resolvedOffsetPx = precisionDrop.resolvedOffsetPx ?? precisionDrop.currentOffsetPx;
  const resultIntent = resolvedOffsetPx <= 6 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          primaryMetric: resolvedOffsetPx,
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (precisionDrop.state === "cleared") {
      playRunClear();
    } else if (precisionDrop.state === "failed") {
      playRunFail();
    }
  }, [precisionDrop.state]);

  return {
    finishDetail: isRunCleared
      ? "A smaller offset scores better and opens the Result screen automatically."
      : isRunFailed
        ? "Missed runs are recorded for history and open the Result screen automatically."
        : "Tap once when the ball overlaps the line. If the ball drops past the lane, the run is recorded as missed.",
    handleLaneClick() {
      playBallDrop();
      precisionDrop.captureHit();
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      precisionDrop.beginRun();
    },
    isLiveRun,
    isRunIdle,
    lanePrompt: isLiveRun
      ? "Tap anywhere in the lane when the ball overlaps the line."
      : isRunCleared
        ? "Hit recorded. The Result screen opens automatically."
        : isRunFailed
          ? "The ball passed the line before the hit landed."
          : "Press Start run, then tap when the ball overlaps the line.",
    precisionDrop,
    resolvedOffsetPx,
    runStatusLabel: isRunCleared ? "Hit" : isRunFailed ? "Missed" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : isLiveRun
          ? "Tap on overlap"
          : "Start run to arm the lane",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Drop again" : "Start run",
    timeLabel: formatElapsedMs(precisionDrop.elapsedMs),
  };
}
