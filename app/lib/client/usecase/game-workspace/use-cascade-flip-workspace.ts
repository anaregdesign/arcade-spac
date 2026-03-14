import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useCascadeFlipSession } from "./use-cascade-flip-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useCascadeFlipWorkspace(workspace: GameWorkspaceController) {
  const cascadeFlip = useCascadeFlipSession(workspace.difficulty);
  const isRunIdle = cascadeFlip.state === "idle";
  const isLiveRun = cascadeFlip.state === "revealing" || cascadeFlip.state === "tracking";
  const isRunCleared = cascadeFlip.state === "cleared";
  const isRunFailed = cascadeFlip.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: cascadeFlip.missCount,
          primaryMetric: Math.max(1, cascadeFlip.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (cascadeFlip.state === "cleared") {
      playRunClear();
    } else if (cascadeFlip.state === "failed") {
      playRunFail();
    }
  }, [cascadeFlip.state]);

  return {
    cascadeFlip,
    finishDetail: isRunCleared
      ? `The full stream was cleared with ${cascadeFlip.resolvedCount} cards resolved and ${cascadeFlip.missCount} misses recorded.`
      : isRunFailed
        ? `The timer expired after ${cascadeFlip.resolvedCount}/${cascadeFlip.cardGoal} cards with ${cascadeFlip.missCount} misses.`
        : "Memorize the reveal strip, then track the moving stream and tap only the next correct card in order.",
    handleCardPress(cardId: string) {
      const result = cascadeFlip.tapCard(cardId);

      if (result === "correct" || result === "round-cleared") {
        playTapCorrect();
      } else if (result === "miss") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      cascadeFlip.beginRun();
    },
    isInputPhase: cascadeFlip.phase === "live",
    isLiveRun,
    isRevealPhase: cascadeFlip.phase === "reveal",
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : cascadeFlip.phase === "reveal" ? "Reveal" : cascadeFlip.phase === "live" ? "Tracking" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Track the stream",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another stream" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, cascadeFlip.timeLimitSeconds - cascadeFlip.elapsedSeconds)),
  };
}
