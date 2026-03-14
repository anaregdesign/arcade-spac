import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useIconChainSession } from "./use-icon-chain-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useIconChainWorkspace(workspace: GameWorkspaceController) {
  const iconChain = useIconChainSession(workspace.difficulty);
  const isRunIdle = iconChain.state === "idle";
  const isWatching = iconChain.state === "watching";
  const isInputting = iconChain.state === "inputting";
  const isLiveRun = isWatching || isInputting;
  const isRunCleared = iconChain.state === "cleared";
  const isRunFailed = iconChain.state === "failed";
  const resultIntent = iconChain.wrongPickCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: iconChain.wrongPickCount,
          primaryMetric: Math.max(1, iconChain.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (iconChain.state === "cleared") {
      playRunClear();
    } else if (iconChain.state === "failed") {
      playRunFail();
    }
  }, [iconChain.state]);

  return {
    finishDetail: isRunCleared
      ? `All ${iconChain.roundCount} clue rounds were cleared with ${iconChain.wrongPickCount} wrong picks. Best live chain reached ${iconChain.longestChainLength}.`
      : isRunFailed
        ? `The timer expired after ${iconChain.roundSolvedCount} of ${iconChain.roundCount} clue rounds were solved.`
        : isWatching
          ? "Memorize the full icon order now. The clue board unlocks after the watch phase ends."
          : "The first icon is anchored. Build the remaining order from the clue cards, and a wrong pick resets the current chain.",
    handleCandidatePress(iconId: string) {
      const result = iconChain.pressCandidate(iconId);

      if (result === "correct" || result === "solved") {
        playTapCorrect();
      } else if (result === "wrong") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      iconChain.beginRun();
    },
    iconChain,
    isInputting,
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    isWatching,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isWatching ? "Watching" : isInputting ? "Clue board" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : isWatching
          ? "Memorize the order"
          : "Build the chain",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another chain" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, iconChain.timeLimitSeconds - iconChain.elapsedSeconds)),
  };
}
