import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useSyncPulseSession } from "./use-sync-pulse-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useSyncPulseWorkspace(workspace: GameWorkspaceController) {
  const syncPulse = useSyncPulseSession(workspace.difficulty);
  const isRunIdle = syncPulse.state === "idle";
  const isLiveRun = syncPulse.state === "playing";
  const isRunCleared = syncPulse.state === "cleared";
  const isRunFailed = syncPulse.state === "failed";
  const resultIntent = syncPulse.missCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          hintCount: syncPulse.perfectHitCount,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: syncPulse.missCount,
          primaryMetric: Math.max(1, syncPulse.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (syncPulse.state === "cleared") {
      playRunClear();
    } else if (syncPulse.state === "failed") {
      playRunFail();
    }
  }, [syncPulse.state]);

  return {
    finishDetail: isRunCleared
      ? `All ${syncPulse.waveGoal} waves cleared with ${syncPulse.perfectHitCount} perfect hits, ${syncPulse.goodHitCount} good hits, and ${syncPulse.missCount} misses.`
      : isRunFailed
        ? "The timer expired before every pulse wave was synchronized."
        : "Tap the sync pad while both pulse rings overlap. Perfect and good hits advance the wave, while misses only lower quality.",
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      syncPulse.beginRun();
    },
    handleSyncPress() {
      const result = syncPulse.syncPulse();

      if (result === "perfect" || result === "good") {
        playTapCorrect();
      } else if (result === "miss") {
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
        : "Sync the pulse overlap",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another run" : "Start run",
    syncPulse,
    timeLeftLabel: formatDuration(Math.max(0, syncPulse.timeLimitSeconds - syncPulse.elapsedSeconds)),
  };
}
