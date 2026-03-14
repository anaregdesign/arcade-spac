import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useSpotChangeSession } from "./use-spot-change-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useSpotChangeWorkspace(workspace: GameWorkspaceController) {
  const spotChange = useSpotChangeSession(workspace.difficulty);
  const isRunIdle = spotChange.state === "idle";
  const isLiveRun = spotChange.state === "playing";
  const isRunCleared = spotChange.state === "cleared";
  const isRunFailed = spotChange.state === "failed";
  const resultIntent = spotChange.missCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: spotChange.missCount,
          primaryMetric: Math.max(1, spotChange.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (spotChange.state === "cleared") {
      playRunClear();
    } else if (spotChange.state === "failed") {
      playRunFail();
    }
  }, [spotChange.state]);

  return {
    finishDetail: isRunCleared
      ? "Every comparison round was cleared and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before every difference was found."
        : "Compare the original and changed scenes, then tap only the real differences on the changed board.",
    handleCellPress(rowIndex: number, columnIndex: number) {
      const result = spotChange.pressChangedCell(rowIndex, columnIndex);

      if (result === "correct") {
        playTapCorrect();
      } else if (result === "wrong") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      spotChange.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Comparing" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Find every change",
    spotChange,
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another scene set" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, spotChange.timeLimitSeconds - spotChange.elapsedSeconds)),
  };
}
