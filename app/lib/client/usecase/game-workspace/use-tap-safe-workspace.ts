import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useTapSafeSession } from "./use-tap-safe-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useTapSafeWorkspace(workspace: GameWorkspaceController) {
  const tapSafe = useTapSafeSession(workspace.difficulty);
  const isRunIdle = tapSafe.state === "idle";
  const isLiveRun = tapSafe.state === "playing";
  const isRunCleared = tapSafe.state === "cleared";
  const isRunFailed = tapSafe.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const resultIntent = tapSafe.penaltyCount === 0 ? "completeClean" : "completeSteady";
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: tapSafe.penaltyCount,
          primaryMetric: Math.max(1, tapSafe.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (tapSafe.state === "cleared") {
      playRunClear();
    } else if (tapSafe.state === "failed") {
      playRunFail();
    }
  }, [tapSafe.state]);

  return {
    finishDetail: isRunCleared
      ? `Goal reached with ${tapSafe.safeHitCount} safe hits, ${tapSafe.hazardTapCount} hazard taps, and ${tapSafe.accuracyPercent}% accuracy.`
      : isRunFailed
        ? "The timer expired before the safe-hit goal was reached."
        : "Tap only the safe targets. Hazard taps and missed safe targets both add penalties.",
    handleCellPress(rowIndex: number, columnIndex: number) {
      const result = tapSafe.tapCell(rowIndex, columnIndex);

      if (result === "safe") {
        playTapCorrect();
      } else if (result === "hazard") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      tapSafe.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Filter the wave",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another run" : "Start run",
    tapSafe,
    timeLeftLabel: formatDuration(Math.max(0, tapSafe.timeLimitSeconds - tapSafe.elapsedSeconds)),
  };
}
