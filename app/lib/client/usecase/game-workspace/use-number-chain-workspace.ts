import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../sound-effects";
import { formatDuration } from "./display";
import { useNumberChainSession } from "./use-number-chain-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useNumberChainWorkspace(workspace: GameWorkspaceController) {
  const numberChain = useNumberChainSession(workspace.difficulty);
  const isRunIdle = numberChain.state === "idle";
  const isLiveRun = numberChain.state === "playing";
  const isRunCleared = numberChain.state === "cleared";
  const isRunFailed = numberChain.state === "failed";
  const resultIntent = numberChain.wrongTapCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: numberChain.wrongTapCount,
          primaryMetric: numberChain.elapsedSeconds,
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (numberChain.state === "cleared") {
      playRunClear();
    } else if (numberChain.state === "failed") {
      playRunFail();
    }
  }, [numberChain.state]);

  return {
    finishDetail: isRunCleared
      ? "The clear time and wrong taps were captured. The Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the last number was reached."
        : "Only the current next number advances the chain. Wrong taps count against quality.",
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      numberChain.beginRun();
    },
    handleTilePress(rowIndex: number, columnIndex: number) {
      const cell = numberChain.board[rowIndex]?.[columnIndex];

      if (numberChain.state === "playing" && cell && !cell.isCleared) {
        if (cell.value === numberChain.nextNumber) {
          playTapCorrect();
        } else {
          playTapWrong();
        }
      }

      numberChain.tapCell(rowIndex, columnIndex);
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    numberChain,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Tap in order",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, numberChain.timeLimitSeconds - numberChain.elapsedSeconds)),
  };
}
