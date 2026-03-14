import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useStackSortSession } from "./use-stack-sort-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useStackSortWorkspace(workspace: GameWorkspaceController) {
  const stackSort = useStackSortSession(workspace.difficulty);
  const isRunIdle = stackSort.state === "idle";
  const isLiveRun = stackSort.state === "playing";
  const isRunCleared = stackSort.state === "cleared";
  const isRunFailed = stackSort.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: stackSort.moveCount,
          primaryMetric: Math.max(1, stackSort.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (stackSort.state === "cleared") {
      playRunClear();
    } else if (stackSort.state === "failed") {
      playRunFail();
    }
  }, [stackSort.state]);

  return {
    finishDetail: isRunCleared
      ? "Every stack was sorted by color and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the stacks were sorted."
        : "Select a source stack, then a destination stack. Legal moves raise the move count and invalid moves are ignored.",
    handleStackPress(stackIndex: number) {
      const result = stackSort.selectStack(stackIndex);

      if (result === "moved" || result === "selected" || result === "deselected") {
        playTapCorrect();
      } else if (result === "invalid") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      stackSort.beginRun();
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
        : "Sort the stacks",
    stackSort,
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another puzzle" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, stackSort.timeLimitSeconds - stackSort.elapsedSeconds)),
  };
}
