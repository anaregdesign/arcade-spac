import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useBeatMatchSession } from "./use-beat-match-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useBeatMatchWorkspace(workspace: GameWorkspaceController) {
  const beatMatch = useBeatMatchSession(workspace.difficulty);
  const isRunIdle = beatMatch.state === "idle";
  const isLiveRun = beatMatch.state === "playing";
  const isRunCleared = beatMatch.state === "cleared";
  const isRunFailed = beatMatch.state === "failed";
  const resultIntent = beatMatch.missCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          hintCount: beatMatch.maxComboCount,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: beatMatch.missCount,
          primaryMetric: Math.max(1, beatMatch.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (beatMatch.state === "cleared") {
      playRunClear();
    } else if (beatMatch.state === "failed") {
      playRunFail();
    }
  }, [beatMatch.state]);

  return {
    beatMatch,
    finishDetail: isRunCleared
      ? `Hit goal cleared with ${beatMatch.accuracyPercent}% accuracy, ${beatMatch.maxComboCount} max combo, and ${beatMatch.missCount} misses.`
      : isRunFailed
        ? "The stream ended or the timer expired before the hit goal was reached."
        : "Tap the highlighted lane while the timing marker crosses the center zone. Perfect and good hits both raise the progress goal.",
    handleLanePress(laneIndex: number) {
      const result = beatMatch.tapLane(laneIndex);

      if (result === "perfect" || result === "good") {
        playTapCorrect();
      } else if (result === "miss") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      beatMatch.beginRun();
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
        : "Tap the active lane",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another run" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, beatMatch.timeLimitSeconds - beatMatch.elapsedSeconds)),
  };
}
