import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { usePhaseLockSession } from "./use-phase-lock-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function usePhaseLockWorkspace(workspace: GameWorkspaceController) {
  const phaseLock = usePhaseLockSession(workspace.difficulty);
  const isRunIdle = phaseLock.state === "idle";
  const isLiveRun = phaseLock.state === "playing";
  const isRunCleared = phaseLock.state === "cleared";
  const isRunFailed = phaseLock.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const resultIntent = phaseLock.timingErrorCount === 0 ? "completeClean" : "completeSteady";
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: phaseLock.timingErrorCount,
          primaryMetric: Math.max(1, phaseLock.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (phaseLock.state === "cleared") {
      playRunClear();
    } else if (phaseLock.state === "failed") {
      playRunFail();
    }
  }, [phaseLock.state]);

  return {
    finishDetail: isRunCleared
      ? `All wheels were locked with ${phaseLock.timingErrorCount} timing errors and ${phaseLock.accuracyPercent}% lock accuracy.`
      : isRunFailed
        ? "The timer expired before every wheel was locked inside its target band."
        : "Lock the highlighted wheel only while its marker is inside the target band. Misses keep the wheel spinning and add timing errors.",
    handleLockPress() {
      const result = phaseLock.lockCurrentWheel();

      if (result === "hit") {
        playTapCorrect();
      } else if (result === "miss") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      phaseLock.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    phaseLock,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Locking" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Lock the active wheel",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another run" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, phaseLock.timeLimitSeconds - phaseLock.elapsedSeconds)),
  };
}
