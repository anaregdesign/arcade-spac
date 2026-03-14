import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useTempoWeaveSession } from "./use-tempo-weave-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useTempoWeaveWorkspace(workspace: GameWorkspaceController) {
  const tempoWeave = useTempoWeaveSession(workspace.difficulty);
  const isRunIdle = tempoWeave.state === "idle";
  const isLiveRun = tempoWeave.state === "playing";
  const isRunCleared = tempoWeave.state === "cleared";
  const isRunFailed = tempoWeave.state === "failed";
  const resultIntent = tempoWeave.missCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: tempoWeave.missCount,
          primaryMetric: Math.max(1, tempoWeave.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (tempoWeave.state === "cleared") {
      playRunClear();
    } else if (tempoWeave.state === "failed") {
      playRunFail();
    }
  }, [tempoWeave.state]);

  return {
    finishDetail: isRunCleared
      ? `${tempoWeave.bestStreak} best streak, ${tempoWeave.lanes[0]?.accuracyPercent ?? 0}% left accuracy, ${tempoWeave.lanes[1]?.accuracyPercent ?? 0}% right accuracy, and ${tempoWeave.missCount} misses.`
      : isRunFailed
        ? `The timer expired before both lanes reached their hit goal. Best streak was ${tempoWeave.bestStreak}.`
        : "Watch both lane markers and tap the matching lane only while its marker sits inside the center target zone.",
    handleLanePress(laneId: "left" | "right") {
      const result = tempoWeave.tapLane(laneId);

      if (result === "perfect" || result === "good") {
        playTapCorrect();
      } else if (result === "miss") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      tempoWeave.beginRun();
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
        : "Watch both lanes",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another run" : "Start run",
    tempoWeave,
    timeLeftLabel: formatDuration(Math.max(0, tempoWeave.timeLimitSeconds - tempoWeave.elapsedSeconds)),
  };
}
