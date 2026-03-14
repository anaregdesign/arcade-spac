import { useEffect, useRef } from "react";

import { playCardFlip, playCardMatch, playCardMismatch, playRunClear, playRunFail, playRunStart } from "../../sound-effects";
import { formatDuration } from "./display";
import { usePairFlipSession } from "./use-pair-flip-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function usePairFlipWorkspace(workspace: GameWorkspaceController) {
  const pairFlip = usePairFlipSession(workspace.difficulty);
  const isRunIdle = pairFlip.state === "idle";
  const isLiveRun = pairFlip.state === "playing";
  const isRunCleared = pairFlip.state === "cleared";
  const isRunFailed = pairFlip.state === "failed";
  const resultIntent = pairFlip.mismatchCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: pairFlip.mismatchCount,
          primaryMetric: pairFlip.elapsedSeconds,
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  const prevMatchedPairCountRef = useRef(pairFlip.matchedPairCount);
  const prevMismatchCountRef = useRef(pairFlip.mismatchCount);

  useEffect(() => {
    if (pairFlip.matchedPairCount > prevMatchedPairCountRef.current) {
      playCardMatch();
    } else if (pairFlip.mismatchCount > prevMismatchCountRef.current) {
      playCardMismatch();
    }

    prevMatchedPairCountRef.current = pairFlip.matchedPairCount;
    prevMismatchCountRef.current = pairFlip.mismatchCount;
  }, [pairFlip.matchedPairCount, pairFlip.mismatchCount]);

  useEffect(() => {
    if (pairFlip.state === "cleared") {
      playRunClear();
    } else if (pairFlip.state === "failed") {
      playRunFail();
    }
  }, [pairFlip.state]);

  return {
    finishDetail: isRunCleared
      ? "The clear time and mismatch count were captured. The Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before every pair was matched."
        : "Two open cards lock the board briefly. Memorize each reveal so you can finish with fewer mismatches.",
    handleCardPress(rowIndex: number, columnIndex: number) {
      const card = pairFlip.board[rowIndex]?.[columnIndex];

      if (card && !card.isMatched && !card.isOpen && pairFlip.state === "playing") {
        playCardFlip();
      }

      pairFlip.tapCard(rowIndex, columnIndex);
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      pairFlip.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    pairFlip,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Match every pair",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, pairFlip.timeLimitSeconds - pairFlip.elapsedSeconds)),
  };
}
