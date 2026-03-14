import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useSymbolHuntSession } from "./use-symbol-hunt-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useSymbolHuntWorkspace(workspace: GameWorkspaceController) {
  const symbolHunt = useSymbolHuntSession(workspace.difficulty);
  const isRunIdle = symbolHunt.state === "idle";
  const isLiveRun = symbolHunt.state === "playing";
  const isRunCleared = symbolHunt.state === "cleared";
  const isRunFailed = symbolHunt.state === "failed";
  const resultIntent = symbolHunt.wrongTapCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: symbolHunt.wrongTapCount,
          primaryMetric: Math.max(1, symbolHunt.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (symbolHunt.state === "cleared") {
      playRunClear();
    } else if (symbolHunt.state === "failed") {
      playRunFail();
    }
  }, [symbolHunt.state]);

  return {
    finishDetail: isRunCleared
      ? "Every target symbol was cleared and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before every target symbol was found."
        : "Tap only the target symbol. Wrong taps are counted but the run keeps going.",
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      symbolHunt.beginRun();
    },
    handleTilePress(rowIndex: number, columnIndex: number) {
      const result = symbolHunt.tapCell(rowIndex, columnIndex);

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
        : "Find every target symbol",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run",
    symbolHunt,
    timeLeftLabel: formatDuration(Math.max(0, symbolHunt.timeLimitSeconds - symbolHunt.elapsedSeconds)),
  };
}
