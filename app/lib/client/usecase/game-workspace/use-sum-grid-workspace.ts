import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useSumGridSession } from "./use-sum-grid-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useSumGridWorkspace(workspace: GameWorkspaceController) {
  const sumGrid = useSumGridSession(workspace.difficulty);
  const isRunIdle = sumGrid.state === "idle";
  const isLiveRun = sumGrid.state === "playing";
  const isRunCleared = sumGrid.state === "cleared";
  const isRunFailed = sumGrid.state === "failed";
  const resultIntent = sumGrid.wrongGridCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: sumGrid.wrongGridCount,
          primaryMetric: Math.max(1, sumGrid.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (sumGrid.state === "cleared") {
      playRunClear();
    } else if (sumGrid.state === "failed") {
      playRunFail();
    }
  }, [sumGrid.state]);

  return {
    finishDetail: isRunCleared
      ? "Every target sum grid was completed and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the puzzle set was completed."
        : "Place each candidate number into the grid so every row and column reaches its target sum.",
    handleCellPress(rowIndex: number, columnIndex: number) {
      const result = sumGrid.pressCell(rowIndex, columnIndex);

      if (result === "placed" || result === "removed") {
        playTapCorrect();
      }
    },
    handleNumberPress(value: number) {
      sumGrid.selectNumber(value);
      playTapCorrect();
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      sumGrid.beginRun();
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
        : "Build the next grid",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another set" : "Start run",
    sumGrid,
    timeLeftLabel: formatDuration(Math.max(0, sumGrid.timeLimitSeconds - sumGrid.elapsedSeconds)),
  };
}
