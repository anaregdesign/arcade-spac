import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useTargetTrailSession } from "./use-target-trail-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useTargetTrailWorkspace(workspace: GameWorkspaceController) {
  const targetTrail = useTargetTrailSession(workspace.difficulty);
  const isRunIdle = targetTrail.state === "idle";
  const isLiveRun = targetTrail.state === "playing";
  const isRunCleared = targetTrail.state === "cleared";
  const isRunFailed = targetTrail.state === "failed";
  const resultIntent = targetTrail.missCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: targetTrail.missCount,
          primaryMetric: Math.max(1, targetTrail.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (targetTrail.state === "cleared") {
      playRunClear();
    } else if (targetTrail.state === "failed") {
      playRunFail();
    }
  }, [targetTrail.state]);

  return {
    finishDetail: isRunCleared
      ? "The full trail was cleared. The Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the trail was complete."
        : "Tap only the live target. Wrong taps are counted but the run keeps going.",
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      targetTrail.beginRun();
    },
    handleTilePress(rowIndex: number, columnIndex: number) {
      const result = targetTrail.tapCell(rowIndex, columnIndex);

      if (result === "correct") {
        playTapCorrect();
      } else if (result === "wrong") {
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
        : "Follow the trail",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another trail" : "Start run",
    targetTrail,
    timeLeftLabel: formatDuration(Math.max(0, targetTrail.timeLimitSeconds - targetTrail.elapsedSeconds)),
  };
}
