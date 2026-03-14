import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useChainTriggerSession } from "./use-chain-trigger-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useChainTriggerWorkspace(workspace: GameWorkspaceController) {
  const chainTrigger = useChainTriggerSession(workspace.difficulty);
  const isRunIdle = chainTrigger.state === "idle";
  const isTransitioning = chainTrigger.state === "transitioning";
  const isLiveRun = chainTrigger.state === "planning" || isTransitioning;
  const isRunCleared = chainTrigger.state === "cleared";
  const isRunFailed = chainTrigger.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          hintCount: chainTrigger.extraTriggerUsedCount,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: 0,
          primaryMetric: Math.max(1, chainTrigger.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (chainTrigger.state === "cleared") {
      playRunClear();
    } else if (chainTrigger.state === "failed") {
      playRunFail();
    }
  }, [chainTrigger.state]);

  return {
    chainTrigger,
    finishDetail: isRunCleared
      ? `All ${chainTrigger.puzzleCount} graph puzzles were cleared with ${chainTrigger.extraTriggerUsedCount} extra triggers over ${chainTrigger.fireAttemptCount} fires.`
      : isRunFailed
        ? `The timer expired after ${chainTrigger.solvedRoundCount} of ${chainTrigger.puzzleCount} graph puzzles were solved.`
        : isTransitioning
          ? "The current graph cleared. The next puzzle is loading."
          : "Arm only the extra nodes you need, then fire the source and read the propagation wave by wave.",
    handleArmNode(nodeId: string) {
      const result = chainTrigger.toggleArmNode(nodeId);

      if (result === "armed" || result === "disarmed") {
        playTapCorrect();
      }
    },
    handleClearPrep() {
      if (chainTrigger.clearArmedNodes() === "cleared") {
        playTapWrong();
      }
    },
    handleFireChain() {
      const result = chainTrigger.fireChain();

      if (result === "solved" || result === "transitioning") {
        playTapCorrect();
      } else if (result === "stalled") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      chainTrigger.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    isTransitioning,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isTransitioning ? "Propagating" : isLiveRun ? "Planning" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Fire the chain",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another graph" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, chainTrigger.timeLimitSeconds - chainTrigger.elapsedSeconds)),
  };
}
