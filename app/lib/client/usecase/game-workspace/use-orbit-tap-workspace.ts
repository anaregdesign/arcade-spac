import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useOrbitTapSession } from "./use-orbit-tap-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useOrbitTapWorkspace(workspace: GameWorkspaceController) {
  const orbitTap = useOrbitTapSession(workspace.difficulty);
  const isRunIdle = orbitTap.state === "idle";
  const isLiveRun = orbitTap.state === "playing";
  const isRunCleared = orbitTap.state === "cleared";
  const isRunFailed = orbitTap.state === "failed";
  const resultIntent = orbitTap.missCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: orbitTap.missCount,
          primaryMetric: Math.max(1, orbitTap.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (orbitTap.state === "cleared") {
      playRunClear();
    } else if (orbitTap.state === "failed") {
      playRunFail();
    }
  }, [orbitTap.state]);

  return {
    finishDetail: isRunCleared
      ? "Clear time and misses were captured. The Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before every orbit hit was completed."
        : "Tap while the moving marker passes through the gate. Clean hits advance the run and misses are recorded.",
    handleOrbitPress() {
      const result = orbitTap.tapOrbit();

      if (result === "hit") {
        playTapCorrect();
      } else if (result === "miss") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      orbitTap.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    orbitTap,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Chain clean orbit hits",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another run" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, orbitTap.timeLimitSeconds - orbitTap.elapsedSeconds)),
  };
}
