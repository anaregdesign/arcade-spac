import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useSwapSolveSession } from "./use-swap-solve-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useSwapSolveWorkspace(workspace: GameWorkspaceController) {
  const swapSolve = useSwapSolveSession(workspace.difficulty);
  const isRunIdle = swapSolve.state === "idle";
  const isLiveRun = swapSolve.state === "playing";
  const isRunCleared = swapSolve.state === "cleared";
  const isRunFailed = swapSolve.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const resultIntent = swapSolve.swapCount === 0 ? "completeClean" : "completeSteady";
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: swapSolve.swapCount,
          primaryMetric: Math.max(1, swapSolve.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (swapSolve.state === "cleared") {
      playRunClear();
    } else if (swapSolve.state === "failed") {
      playRunFail();
    }
  }, [swapSolve.state]);

  return {
    finishDetail: isRunCleared
      ? "The live board matched the target arrangement and the Result screen opens automatically."
      : isRunFailed
        ? "The swap budget or timer ran out before the board was restored."
        : "Select two tiles to swap their positions until the live board matches the target.",
    handleCellPress(rowIndex: number, columnIndex: number) {
      const result = swapSolve.pressCell(rowIndex, columnIndex);

      if (result === "selected" || result === "swapped" || result === "solved") {
        playTapCorrect();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      swapSolve.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Failed" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Swap into place",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run",
    swapSolve,
    timeLeftLabel: formatDuration(Math.max(0, swapSolve.timeLimitSeconds - swapSolve.elapsedSeconds)),
  };
}
