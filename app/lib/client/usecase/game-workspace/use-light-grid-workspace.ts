import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useLightGridSession } from "./use-light-grid-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useLightGridWorkspace(workspace: GameWorkspaceController) {
  const lightGrid = useLightGridSession(workspace.difficulty);
  const isRunIdle = lightGrid.state === "idle";
  const isLiveRun = lightGrid.state === "playing";
  const isRunCleared = lightGrid.state === "cleared";
  const isRunFailed = lightGrid.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: lightGrid.moveCount,
          primaryMetric: Math.max(1, lightGrid.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (lightGrid.state === "cleared") {
      playRunClear();
    } else if (lightGrid.state === "failed") {
      playRunFail();
    }
  }, [lightGrid.state]);

  return {
    finishDetail: isRunCleared
      ? "The live board matched the target pattern and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the target grid was matched."
        : "Tap a cell to flip it and its orthogonal neighbors. Match the target pattern as efficiently as you can.",
    handleCellPress(rowIndex: number, columnIndex: number) {
      const result = lightGrid.toggleCell(rowIndex, columnIndex);

      if (result === "toggled") {
        playTapCorrect();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      lightGrid.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    lightGrid,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Match the target grid",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another grid" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, lightGrid.timeLimitSeconds - lightGrid.elapsedSeconds)),
  };
}
