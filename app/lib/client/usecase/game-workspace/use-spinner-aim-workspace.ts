import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useSpinnerAimSession } from "./use-spinner-aim-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useSpinnerAimWorkspace(workspace: GameWorkspaceController) {
  const spinnerAim = useSpinnerAimSession(workspace.difficulty);
  const isRunIdle = spinnerAim.state === "idle";
  const isLiveRun = spinnerAim.state === "playing";
  const isRunCleared = spinnerAim.state === "cleared";
  const isRunFailed = spinnerAim.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const badShotCount = spinnerAim.hazardHitCount + spinnerAim.missCount;
  const resultIntent = badShotCount === 0 ? "completeClean" : "completeSteady";
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: badShotCount,
          primaryMetric: Math.max(1, spinnerAim.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (spinnerAim.state === "cleared") {
      playRunClear();
    } else if (spinnerAim.state === "failed") {
      playRunFail();
    }
  }, [spinnerAim.state]);

  return {
    finishDetail: isRunCleared
      ? `Goal cleared with ${spinnerAim.hitCount} target hits, ${spinnerAim.hazardHitCount} hazard hits, and ${spinnerAim.accuracyPercent}% accuracy.`
      : isRunFailed
        ? "The timer expired before the target-hit goal was reached."
        : "Fire when the launcher points through the target arc. Hazard hits and off-target shots both count as bad shots.",
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      spinnerAim.beginRun();
    },
    handleTriggerPress() {
      const result = spinnerAim.fireShot();

      if (result === "target") {
        playTapCorrect();
      } else if (result === "hazard" || result === "miss") {
        playTapWrong();
      }
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
        : "Fire through the target arc",
    spinnerAim,
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another run" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, spinnerAim.timeLimitSeconds - spinnerAim.elapsedSeconds)),
  };
}
