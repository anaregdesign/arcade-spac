import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useTileShiftSession } from "./use-tile-shift-session";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useTileShiftWorkspace(workspace: GameWorkspaceController) {
  const tileShift = useTileShiftSession(workspace.difficulty);
  const isRunIdle = tileShift.state === "idle";
  const isLiveRun = tileShift.state === "playing";
  const isRunCleared = tileShift.state === "cleared";
  const isRunFailed = tileShift.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: tileShift.moveCount,
          primaryMetric: Math.max(1, tileShift.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (tileShift.state === "cleared") {
      playRunClear();
    } else if (tileShift.state === "failed") {
      playRunFail();
    }
  }, [tileShift.state]);

  return {
    finishDetail: isRunCleared
      ? "The live board matched the target board and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the rows and columns were aligned."
        : "Shift rows or columns one step at a time until the live board matches the target.",
    handleColumnShift(columnIndex: number) {
      tileShift.shiftColumn(columnIndex);
      playTapCorrect();
    },
    handleRowShift(rowIndex: number) {
      tileShift.shiftRow(rowIndex);
      playTapCorrect();
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      tileShift.beginRun();
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
        : "Align the board",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another scramble" : "Start run",
    tileShift,
    timeLeftLabel: formatDuration(Math.max(0, tileShift.timeLimitSeconds - tileShift.elapsedSeconds)),
  };
}
