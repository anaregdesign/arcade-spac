import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useTempoHoldSession } from "./use-tempo-hold-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useTempoHoldWorkspace(workspace: GameWorkspaceController) {
  const tempoHold = useTempoHoldSession(workspace.difficulty);
  const isRunIdle = tempoHold.state === "idle";
  const isLiveRun = tempoHold.state === "playing";
  const isRunCleared = tempoHold.state === "cleared";
  const isRunFailed = tempoHold.state === "failed";
  const resultIntent = tempoHold.missCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          hintCount: tempoHold.perfectReleaseCount,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: tempoHold.missCount,
          primaryMetric: Math.max(1, tempoHold.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (tempoHold.state === "cleared") {
      playRunClear();
    } else if (tempoHold.state === "failed") {
      playRunFail();
    }
  }, [tempoHold.state]);

  return {
    finishDetail: isRunCleared
      ? `All ${tempoHold.roundGoal} rounds cleared with ${tempoHold.perfectReleaseCount} perfect releases, ${tempoHold.goodReleaseCount} good releases, and an average delta of ${tempoHold.averageReleaseDeltaMs} ms.`
      : isRunFailed
        ? "The timer expired before every hold round was completed."
        : "Press and hold until the meter enters the target zone, then release. Perfect and good releases both advance the round.",
    handleHoldPressStart() {
      tempoHold.startHold();
    },
    handleHoldRelease() {
      const result = tempoHold.releaseHold();

      if (result === "perfect" || result === "good") {
        playTapCorrect();
      } else if (result === "miss") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      tempoHold.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Holding" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : tempoHold.isHolding
          ? "Release in the target zone"
          : "Press and hold",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another run" : "Start run",
    tempoHold,
    timeLeftLabel: formatDuration(Math.max(0, tempoHold.timeLimitSeconds - tempoHold.elapsedSeconds)),
  };
}
